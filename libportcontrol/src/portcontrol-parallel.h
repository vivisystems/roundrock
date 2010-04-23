#ifndef PORTCONTROL_PARALLEL_H_
#define PORTCONTROL_PARALLEL_H_

#include "portcontrol-structures.h"

#define MAX_PARALLEL_PORTS 20

typedef struct
{
    unsigned char set;
    char portName[100];
    int port;

} ParPort;

#ifdef __cplusplus
extern "C" {
#endif

PortControlImpl getParPortControlImpl();

#ifdef __cplusplus
}
#endif

#endif /*PORTCONTROL_PARALLEL_H_*/
