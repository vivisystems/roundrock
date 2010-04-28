#ifndef PORTCONTROL_SERIAL_H_
#define PORTCONTROL_SERIAL_H_

#include "portcontrol-structures.h"

#define MAX_COM_PORTS  20

typedef struct
{
    long baud;
    char parity;
    char dataBits;
    char stopBits;
    char flowControl;
} SerPortSettings;

typedef struct
{
    unsigned char set;
    char portName[100];
    char portSettings[100];
    int port;

    SerPortSettings originalPortSettings;

} SerPort;

#ifdef __cplusplus
extern "C" {
#endif

PortControlImpl getSerPortControlImpl();

#ifdef __cplusplus
}
#endif

#endif /*PORTCONTROL_SERIAL_H_*/