#ifndef DALLAS_H_
#define DALLAS_H_

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

#include <unistd.h>
#include <sys/io.h>


#ifdef __cplusplus
extern "C" {
#endif

int ow_init(void);
int ow_close(void);
int ow_read8crc(unsigned char *buf);
int ow_read(unsigned char *buf);
int ow_read2hex(char *buf);

#ifdef __cplusplus
   }
#endif

#endif /* DALLAS_H_ */
