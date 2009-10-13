#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <memory.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/time.h>
#include <linux/ppdev.h>
#include <linux/parport.h>

#include "portcontrol-error.h"
#include "portcontrol-parallel.h"

static long parMatchPortName        (char const * portName);
static long parOpenPort             (char const * portName, char const * portSettings);
static long parWritePort            (char const * portName, char const * writeBuffer, long length);
static long parReadPort             (char const * portName, char * readBuffer, long length);
static int  parStatusPort			(char const * portName);
static long parHdwrResetDevice      (char const * portName);
static long parClosePort            (char const * portName);
static void parReleaseImpl          ();

ParPort parPorts[MAX_PARALLEL_PORTS];

PortControlImpl getParPortControlImpl()
{
    memset(parPorts, 0x00, sizeof(parPorts));

    PortControlImpl impl;

    impl.matchPortName          = parMatchPortName;
    impl.openPort               = parOpenPort;
    impl.writePort              = parWritePort;
    impl.readPort               = parReadPort;
    impl.statusPort				  = parStatusPort;
	impl.hdwrResetDevice			  = parHdwrResetDevice;
    impl.closePort              = parClosePort;
    impl.releaseImpl            = parReleaseImpl;

    return impl;
}

static ParPort * parFindPort(char const * portName)
{
    int i = 0;
    for (; i < MAX_PARALLEL_PORTS; i++)
    {
        if (parPorts[i].set != 0)
            if (strcmp(parPorts[i].portName, portName) == 0)
                break;
    }

    if (i == MAX_PARALLEL_PORTS)
    {
        return NULL;
    }

    return &parPorts[i];
}

static long parMatchPortName (char const * portName)
{
    if (strncmp(portName, "/dev/parport", 12) == 0)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }
    if (strncmp(portName, "/dev/lp", 7) == 0)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }

    return PORTCONTROL_ERROR_NOT_AVAILABLE;
}


static long parOpenPort (char const * portName, char const * portSettings)
{
    ParPort * oldParPort = parFindPort(portName);
    if (oldParPort != NULL)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }

    int i = 0;
    for (; i < MAX_PARALLEL_PORTS; i++)
    {
        if (parPorts[i].set == 0)
            break;
    }
    if ( i == MAX_PARALLEL_PORTS)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    ParPort parPort;

    memset(&parPort, 0x00, sizeof(ParPort));
    parPort.set = 1;
    strcpy(parPort.portName, portName);

    parPort.port = open(parPort.portName, O_RDWR | O_NONBLOCK);
    if (parPort.port == -1)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    if (ioctl(parPort.port, PPCLAIM))
    {
        close(parPort.port);
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    memcpy(&parPorts[i], &parPort, sizeof(ParPort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static unsigned char getOnlineStatus(ParPort * parPort)
{
    int mode = IEEE1284_MODE_COMPAT;
    if (ioctl(parPort->port, PPNEGOT, &mode))
    {
        return 0;
    }

    unsigned char portError = 0;
    if (ioctl(parPort->port, PPRSTATUS, &portError))
    {
        return 0;
    }

    return (((portError & PARPORT_STATUS_ERROR) != 0) && ((portError & PARPORT_STATUS_BUSY) != 0) ) ?1:0;
}


static long parWritePort (char const * portName, char const * writeBuffer, long length)
{
    ParPort * parPort = parFindPort(portName);
    if (parPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    long reqWriteLength             = length;
    long subWriteLength             = 0;
    long writeLength                = 0;
    char const * writeBufferPtr     = NULL;
    long timeout                    = 5000;

    writeBufferPtr = writeBuffer;

    if (getOnlineStatus(parPort))
    {
        if ((subWriteLength = write(parPort->port, writeBufferPtr, (long) reqWriteLength)) != -1)
            writeLength = subWriteLength;
    }

    while ((writeLength < (long) reqWriteLength) && (timeout > 0))
    {
        if (subWriteLength <= 0)
        {
            struct timeval sleepTime;
            sleepTime.tv_sec = 0;
            sleepTime.tv_usec = 50 * 1000;

            select(0, NULL, NULL, NULL, &sleepTime);

            if (timeout < 50)
                timeout = 0;
            else
                timeout -= 50;
        }
        else
        {
            timeout = 5000;
        }

        subWriteLength = 0;

        if (getOnlineStatus(parPort) == 0)
        {
            continue;
        }

        writeBufferPtr = (char *) &writeBuffer[writeLength];
        if ((subWriteLength = write(parPort->port, writeBufferPtr, (long) (reqWriteLength - writeLength))) != -1)
            writeLength += subWriteLength;
    }

    return writeLength;
}

static long parReadPort (char const * portName, char * readBuffer, long length)
{
    ParPort * parPort = parFindPort(portName);
    if (parPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    int mode = IEEE1284_MODE_COMPAT;
    ioctl(parPort->port, PPNEGOT, &mode);
    mode = IEEE1284_MODE_NIBBLE;
    if (ioctl(parPort->port, PPNEGOT, &mode))
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    long readLength = 0;

    if ((readLength = read(parPort->port, readBuffer, length)) < 0)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    return readLength;
}


static int parStatusPort(char const * portName )
{
	ParPort * parPort = parFindPort(portName);
	if (parPort == NULL)
	{
	    return PORTCONTROL_ERROR_NOT_OPEN;
	}

	int status = IEEE1284_MODE_COMPAT;
    if (ioctl(parPort->port, PPNEGOT, &status))
    {
        return 0;
    }

    unsigned char portStatus = 0;
    if (ioctl(parPort->port, PPRSTATUS, &portStatus) == 0)
    {
        return portStatus;
    }else {
    	return PORTCONTROL_ERROR_IO_FAIL;
    }
}

static long parHdwrResetDevice (char const * portName)
{
    ParPort * parPort = parFindPort(portName);
    if (parPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    int mode = IEEE1284_MODE_COMPAT;
    if (ioctl(parPort->port, PPNEGOT, &mode))
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    do
    {
        struct ppdev_frob_struct frob = {PARPORT_CONTROL_INIT, 0};
        if (ioctl(parPort->port, PPFCONTROL, &frob))
            break;

        struct timeval sleepTime;
        sleepTime.tv_sec = 0;
        sleepTime.tv_usec = 1000;

        select(0, NULL, NULL, NULL, &sleepTime);

        frob.val = PARPORT_CONTROL_INIT;
        if (ioctl(parPort->port, PPFCONTROL, &frob))
            break;

        return PORTCONTROL_ERROR_SUCCESS;
    } while (0);

    return PORTCONTROL_ERROR_IO_FAIL;
}

static long parClosePort (char const * portName)
{
    ParPort * parPort = parFindPort(portName);
    if (parPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    ioctl(parPort->port, PPRELEASE);

    close(parPort->port);

    memset(parPort, 0x00, sizeof(ParPort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static void parReleaseImpl ()
{
    int i = 0;
    for (; i < MAX_PARALLEL_PORTS; i++)
    {
        if (parPorts[i].set != 0)
        {
            parClosePort(parPorts[i].portName);
        }
    }
}
