#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include <rpc/des_crypt.h>
#include <sys/types.h>
#include "encrypt.h"


failed() {
  return 1;
}


void usage(char *cmd) {
  fprintf(stderr, "usage: %s keyfile\n", cmd);
}


int main(int argc, char **argv) {

  int r;
  int mounts;
  char cmd_buf[1024];
  char md5_sum[1024];
  char serial_number[1024];
  char key_buf[2048];

  char *KEYFILE;

  pid_t pid;
  pid_t ppid;

  size_t key_len;

  FILE *f;

  if (argc != 2) {
    usage(argv[0]);
    return failed();
  }

  KEYFILE = argv[1];

  printf("*** Begin\n");

  // get process and parent process ID's
  pid = getpid();
  ppid = getppid();

  // verify no external mounts exist
  printf("==> check external mounts\n");
  sprintf(cmd_buf, "awk '{print $1}' /proc/%d/mounts 2>/dev/null | grep -c -v none 2>/dev/null", pid);
  f = popen(cmd_buf, "r");
  if (f != NULL) {
    r = fscanf(f, "%d", &mounts);
    pclose(f);

    if (r == 1) printf("    - Number of external mounts [%d]\n", mounts);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to retrieve external mount\n");
    return failed();
  }
  printf("<== check external mounts\n");

  // verify path of parent process
  printf("==> verify parent process\n");
  sprintf(cmd_buf, "/proc/%d/cmdline", ppid);
  f = fopen(cmd_buf, "r");
  if (f != NULL) {
    r = fscanf(f, "%s", cmd_buf);
    pclose(f);

    if (r == 1) printf("    - Parent process [%s]\n", cmd_buf);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to verify parent process\n");
    return failed();
  }
  printf("<== verify parent process\n");

  // compute MD5 digest
  printf("==> compute MD5 digest\n");
  sprintf(cmd_buf, "cd /; %s -r -l %s 2>/dev/null | %s", MD5DEEP, MD5_PATH, MD5DEEP);
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
  sprintf(cmd_buf, "%s 2>/dev/null", GETLICENSE);
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

  // decrypt private key
  printf("==> decrypt private key\n");

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
  printf("    - private key decrypted [%s]\n", key_buf + serial_len);
  printf("<== decrypt private key\n");

  printf("*** End\n");

  return 0;
}
