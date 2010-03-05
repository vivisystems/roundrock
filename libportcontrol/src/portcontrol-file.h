#ifndef PORTCONTROL_FILE_H_
#define PORTCONTROL_FILE_H_

#include "portcontrol-structures.h"

#define MAX_NUM_FILES 100

typedef struct
{
    unsigned char set;
    char fileName[100];
    char fileSettings[100];
    int handle;

} FilePort;

#ifdef __cplusplus
extern "C" {
#endif

PortControlImpl getFileControlImpl();

#ifdef __cplusplus
}
#endif

#endif /*PORTCONTROL_FILE_H_*/
