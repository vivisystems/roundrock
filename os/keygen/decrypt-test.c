#include <stdio.h>
#include "encrypt.h"

#define	DEBUG	1

extern int decrypt(char *KEYFILE, char *inputkey, unsigned int inputkey_len, unsigned int *outkey_len, int debug);

void usage(char *cmd) {
  fprintf(stderr, "usage: %s keyfile\n", cmd);
}


int main(int argc, char **argv) {

  unsigned int inputkey_len, outkey_len;
  char inputkey_buf[MAX_KEY_SIZE];

  FILE *f;

  if (argc != 2) {
    usage(argv[0]);
    return -1;
  }

  printf("\n*** ROUNDROCK ENCRYPTION VALIDATION\n\n");

  // retrieve key from file
  f = fopen(argv[1], "r");
  if (f != NULL) {
    inputkey_len = read(fileno(f), inputkey_buf, MAX_KEY_SIZE);
    if (ferror(f)) {
      perror("!!! Failed to read key");
      fclose(f);
      return failed();
    }
    fclose(f);
  }
  else {
    inputkey_len = 0;
  }
  inputkey_buf[inputkey_len] = '\0';

  printf("=> key length [%d]\n\n", inputkey_len);
  return decrypt(argv[1], inputkey_buf, inputkey_len, &outkey_len, DEBUG);
}
