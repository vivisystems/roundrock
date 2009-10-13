#ifndef PORTCONTROL_STRUCTURES_H_
#define PORTCONTROL_STRUCTURES_H_

// #define GET_TIME(time) (gettimeofday(&time, NULL))
// #define TIME_DIFF(start,finish) (((finish.tv_sec  - start.tv_sec ) * 1e3) + ((finish.tv_usec - start.tv_usec) / 1e3))

#define NUM_IMPLS	3
#define SER_IMPL_IDX	0
#define PAR_IMPL_IDX	1
#define FILE_IMPL_IDX	2

typedef struct
{
    long (* matchPortName)          (char const * portName);
    long (* openPort)               (char const * portName, char const * portSettings);

    long (* writePort)              (char const * portName, char const * writeBuffer, long length);
    long (* readPort)               (char const * portName, char * readBuffer, long length);

    int (* statusPort)              (char const * portName);
    long (* hdwrResetDevice)        (char const * portName);
    long (* closePort)              (char const * portName);
    void (* releaseImpl)            ();
    long (* inputFlushPort)              (char const * portName);
    long (* outputFlushPort)              (char const * portName);

} PortControlImpl;

#endif /*PORTCONTROL_STRUCTURES_H_*/
