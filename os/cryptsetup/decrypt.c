#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <rpc/des_crypt.h>
#include <sys/types.h>
#include "encrypt.h"


failed() {
  return 1;
}


int decrypt(char *inputkey, unsigned int *outkey_len, int debug) {

  int r;
  int mounts;

  char cmd_buf[1024];
  char md5_sum[1024];
  char serial_number[1025];

  pid_t pid;
  size_t inputkey_len;

  double uptime, idletime;

  FILE *f;

  printf("*** Begin Key Decryption\n");

  // get process and parent process ID's
  pid = getpid();

  // verify no external mounts exist
  printf("==> validating file systems...\n");
  sprintf(cmd_buf, "awk '{print $1}' /proc/%d/mounts 2>/dev/null | grep -c -v none 2>/dev/null", pid);
  f = popen(cmd_buf, "r");
  if (f != NULL) {
    r = fscanf(f, "%d", &mounts);
    pclose(f);

    if (r == 1 && debug) printf("    - Number of external mounts [%d]\n", mounts);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to validate file systems\n");
    return failed();
  }

  if (mounts != 1)
    if (debug)
      printf("!!! Failed to validate file systems\n");
    else
      return failed();

  printf("<== file systems validated\n");

  // validate environment
  printf("==> validating environment...\n");
  f = fopen("/proc/uptime", "r");
  if (f != NULL) {
    r = fscanf(f, "%lf %lf", &uptime, &idletime);
    pclose(f);

    if (r == 2 && debug) printf("    - uptime [%lf] idle time [%lf]\n", uptime, idletime);
  }
  if (f == NULL || r != 2) {
    fprintf(stderr, "!!! Failed to validate environment\n");
    return failed();
  }

  if (uptime > 30) {
    if (debug)
      printf("!!! Failed to validate environment\n");
    else
      return failed();
  }

  printf("<== environment validated\n");

  // compute MD5 digest
  printf("==> computing MD5 digest...\n");
  sprintf(cmd_buf, "cd .; %s -r -l %s 2>/dev/null | sort | %s", MD5DEEP, MD5_PATH, MD5DEEP);
  f = popen(cmd_buf, "r");

  if (f != NULL) {
    r = fscanf(f, "%s", md5_sum);
    pclose(f);

    if (r == 1 && debug) printf("    - MD5 digest [%s]\n", md5_sum);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to compute MD5 digest\n");
    return failed();
  }
  printf("<== MD5 digest computed\n");

  // get system serial number
  printf("==> retrieving system serial number...\n");
  sprintf(cmd_buf, "%s 2>/dev/null", GETLICENSE);
  f = popen(cmd_buf, "r");

  if (f != NULL) {
    r = fscanf(f, "%1024s", serial_number);
    pclose(f);

    if (r == 1 && debug) printf("    - System serial number [%s]\n", serial_number);
  }
  if (f == NULL || r != 1) {
    fprintf(stderr, "!!! Failed to retrieve system serial number\n");
    return failed();
  }
  printf("<== system serial number retrieved\n");

  // decrypt private key
  printf("==> decrypting key...\n");

  inputkey_len = strlen(inputkey);
  if (1) printf("    - key size [%d]\n", inputkey_len);

  des_setparity(md5_sum);
  r = ecb_crypt(md5_sum, inputkey, inputkey_len, DES_DECRYPT | DES_SW);
  if (r != DESERR_NONE) {
    fprintf(stderr, "!!! Failed to decrypt key\n");
    return failed();
  }

  size_t serial_len = strlen(serial_number);
  if (serial_len%8 > 0) {
    serial_len += (8 - serial_len%8);
  }

  // allocate memory for private key
  char *outkey = (char *) malloc((size_t) strlen(inputkey + serial_len) + 1);

  strcpy(outkey, inputkey + serial_len);
  strcpy(inputkey, outkey);
  
  *outkey_len = strlen(inputkey);

  if (debug) printf("    - key decrypted (%d) [%s]\n", *outkey_len, inputkey);
  printf("<== key decrypted\n");

  printf("*** End Key Decryption\n");

  return 0;
}
