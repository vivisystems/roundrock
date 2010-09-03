#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <rpc/des_crypt.h>
#include "encrypt.h"

int failed() {
  return 1;
}

void usage(char *cmd) {
  fprintf(stderr, "usage: %s keyfile\n", cmd);
}

int main(int argc, char **argv) {

  int r;
  char cmd_buf[1024];
  char md5_sum[1024];
  char serial_number[1024];
  char key_buf[MAX_KEY_SIZE];
  
  char STR_private_key[] = PKEY;
  char STR_md5deep[] = MD5DEEP;
  char STR_md5sum[] = MD5SUM;
  char STR_md5files[] = MD5FILES;
  char STR_get_license[] = GETLICENSE;

  char *KEYFILE;

  FILE *f;

  if (argc != 2) {
    usage(argv[0]);
    return failed();
  }

  KEYFILE = argv[1];

  printf("*** Begin [keyfile=%s]\n", KEYFILE);

  // compute MD5 digest
  printf("==> compute MD5 digest\n");
  sprintf(cmd_buf, STR_md5sum, STR_md5deep, STR_md5files, KEYFILE, STR_md5deep);
  printf("    - buffer [%s]\n", cmd_buf);

  f = popen(cmd_buf, "r");

  if (f != NULL) {
    r = fscanf(f, "%s", md5_sum);
    pclose(f);

    if (r == 1) printf("    - MD5 digest [%s]\n", md5_sum);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to compute MD5 digest\n");
    return failed();
  }
  printf("<== MD5 digest computed\n");

  // get system serial number
  printf("==> retrieve system serial number\n");
  sprintf(cmd_buf, "%s 2>/dev/null", STR_get_license);
  printf("    - buffer [%s]\n", cmd_buf);

  f = popen(cmd_buf, "r");

  if (f != NULL) {
    r = fscanf(f, "%s", serial_number);
    pclose(f);

    if (r == 1) printf("    - System serial number [%s]\n", serial_number);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to retrieve system serial number\n");
    return failed();
  }
  printf("<== system serial number retrieved\n");

  // generate public key
  printf("==> generate public key\n");
  size_t key_len = strlen(serial_number);

  // check if we need to pad key
  int pad_len = (8 - key_len%8)%8;
  char pad_str[] = "XXXXXXXX";

  memset((void *) key_buf, 0, MAX_KEY_SIZE);
  sprintf(key_buf, "%s", serial_number);
  strncat(key_buf, pad_str, pad_len);
  strcat(key_buf, STR_private_key);

  // encrypt
  key_len = strlen(key_buf);
  des_setparity(md5_sum);
  r = ecb_crypt(md5_sum, key_buf, key_len, DES_ENCRYPT | DES_SW);
  if (r != DESERR_NONE) {
    perror("!!! Failed to encrypt root key");
    return failed();
  }
  printf("<== public key generated\n");

  // store public key
  printf("==> store public key\n");
  f = fopen(KEYFILE, "w");
  if (f != NULL) {
    ssize_t count = write(fileno(f), key_buf, key_len);
    fclose(f);

    if (count != key_len) {
      fprintf(stderr, "!!! Failed to store public key; number of bytes written (%d) is not equal to data length (%d)\n", count, key_len);
      return failed();
    }
  }
  else {
    fprintf(stderr, "!!! Failed to create public key file\n");
    return failed();
  }
  printf("<== public key stored\n");

  // validate public key
  printf("==> validate public key\n");

  // retrieve public key from file
  f = fopen(KEYFILE, "r");
  if (f != NULL) {
    key_len = read(fileno(f), key_buf, 2048);
    if (ferror(f)) {
      perror("!!! Failed to read public key");
      fclose(f);
      return failed();
    }
    fclose(f);
  }

  des_setparity(md5_sum);
  r = ecb_crypt(md5_sum, key_buf, key_len, DES_DECRYPT | DES_SW);
  if (r != DESERR_NONE) {
    perror("!!! Failed to decrypt public key");
    return failed();
  }

  key_buf[key_len] = '\0';

  size_t serial_len = strlen(serial_number);
  if (serial_len%8 > 0) {
    serial_len += (8 - key_len%8);
  }
  if (strcmp(key_buf + serial_len, STR_private_key) != 0) {
    fprintf(stderr, "!!! Failed to verify public key!\n");
    return failed();
  }
  printf("<== public key validated\n");

  printf("*** End\n");

  return 0;
}
