#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <memory.h>
#include <termios.h>
#include <unistd.h>
#include <linux/serial.h>
#include <string.h>
#include <sys/ioctl.h>
#include <sys/time.h>
#include <poll.h>
#include <errno.h>
#include <math.h>

#include "portcontrol-error.h"
#include "portcontrol-serial.h"

static long serMatchPortName        (char const * portName);
static long serOpenPort             (char const * portName, char const * portSettings);
static long serWritePort            (char const * portName, char const * writeBuffer, long length);
static long serReadPortPrv          (char const * portName, char * readBuffer, long length, long minLength, long timeMillis);
static long serAvailablePort        (char const * portName);
static long serReadPort			(char const * portName, char * readBuffer, long length);
static int  serStatusPort		(char const * portName);
static long serHdwrResetDevice      (char const * portName);
static long serClosePort            (char const * portName);
static void serReleaseImpl          ();

static long  serInputFlushPort		(char const * portName);
static long  serOutputFlushPort		(char const * portName);

SerPort serPorts[MAX_COM_PORTS];

PortControlImpl getSerPortControlImpl()
{
    memset(serPorts, 0x00, sizeof(serPorts));

    PortControlImpl impl;

    impl.matchPortName          = serMatchPortName;
    impl.openPort               = serOpenPort;
    impl.writePort              = serWritePort;
    impl.availablePort               = serAvailablePort;
    impl.readPort               = serReadPort;
    impl.statusPort				= serStatusPort;
    impl.hdwrResetDevice		= serHdwrResetDevice;
    impl.closePort              = serClosePort;
    impl.releaseImpl            = serReleaseImpl;
    impl.inputFlushPort              = serInputFlushPort;
    impl.outputFlushPort              = serOutputFlushPort;

    return impl;
}

static SerPort * serFindPort(char const * portName)
{
    int i = 0;
    for (; i < MAX_COM_PORTS; i++)
    {
        if (serPorts[i].set != 0)
            if (strcmp(serPorts[i].portName, portName) == 0)
                break;
    }

    if (i == MAX_COM_PORTS)
    {
        return NULL;
    }

    return &serPorts[i];
}

static long serMatchPortName (char const * portName)
{
    if (strncmp(portName, "/dev/tty", 8) == 0)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }

    return PORTCONTROL_ERROR_NOT_AVAILABLE;
}


static long serConfigurePort(SerPort * serPort, unsigned char saveSettings, SerPortSettings * settings)
{
    struct termios options;

    if (tcgetattr(serPort->port, &options) == -1)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

	// set to default
    options.c_iflag = 0 ; //IGNBRK;
    options.c_oflag = 0;
    options.c_cflag = B19200 | CS8 | CLOCAL | CREAD;
    options.c_lflag = 0;

    //
    // :TRICKY:
    // termios.c_line is not a standard element of the termios structure (as 
    // per the Single Unix Specification 2. This is only present under Linux.
    //
    #ifdef __linux__
    options.c_line = '\0';
    #endif
//    bzero( &options.c_cc, sizeof(options.c_cc) );
    options.c_cc[VTIME] = 0;
    options.c_cc[VMIN]  = 1;

    if (settings->baud != 0)
    {
        speed_t baudRate = B9600;
        switch (settings->baud)
        {
            case 230400: baudRate = B230400;	break;
            case 460800: baudRate = B460800;	break;
            case 500000: baudRate = B500000;	break;
            case 576000: baudRate = B576000;	break;
            case 921600: baudRate = B921600;	break;
            case 1000000: baudRate = B1000000;	break;
            case 1152000: baudRate = B1152000;	break;
            case 1500000: baudRate = B1500000;	break;
            case 2000000: baudRate = B2000000;	break;
            case 2500000: baudRate = B2500000;	break;
            case 3000000: baudRate = B3000000;	break;
            case 3500000: baudRate = B3500000;	break;
            case 4000000: baudRate = B4000000;	break;
            case 115200: baudRate = B115200;	break;
            case 38400:	baudRate = B38400;	break;
            case 19200:	baudRate = B19200;	break;
            case 9600:	baudRate = B9600;	break;
            case 4800:	baudRate = B4800;	break;
            case 2400:	baudRate = B2400;	break;
        }

        if ((cfsetispeed(&options, baudRate) == -1) || (cfsetospeed(&options, baudRate) == -1))
        {
            return PORTCONTROL_ERROR_IO_FAIL;
        }

        options.c_cflag |= (CLOCAL | CREAD);

    }

    if (settings->parity != 0)
    {
        if (settings->parity == 'n')
        {
            options.c_cflag &= ~PARENB;
        }
        else if (settings->parity == 'e')
        {
            options.c_cflag |= PARENB;
            options.c_cflag &= ~PARODD;
            options.c_iflag |= (INPCK | ISTRIP);
        }
        else if (settings->parity == 'o')
        {
            options.c_cflag |= PARENB;
            options.c_cflag |= PARODD;
            options.c_iflag |= (INPCK | ISTRIP);
        }
    }

    if (settings->dataBits != 0)
    {
        if (settings->dataBits == 8)
        {
			options.c_iflag &= ~ISTRIP ; // clear the ISTRIP flag.
            options.c_cflag &= ~CSIZE;
            options.c_cflag |= CS8;
        }
        else if (settings->dataBits == 7)
        {
			options.c_iflag |= ISTRIP ;  // set the ISTRIP flag.
            options.c_cflag &= ~CSIZE;
            options.c_cflag |= CS7;
        }
    }

    if (settings->stopBits != 0)
    {
        if (settings->stopBits == 1)
        {
            options.c_cflag &= ~CSTOPB;
        }
        else if (settings->stopBits == 2)
        {
            options.c_cflag |= CSTOPB;
        }
    }

    if (settings->flowControl != 0)
    {
        if (settings->flowControl == 'n')
        {
		    options.c_iflag &= ~(IXON|IXOFF);        
		    options.c_cflag &= ~CRTSCTS;
        }
        else if (settings->flowControl == 'h')
        {
		    options.c_iflag &= ~ (IXON|IXOFF);
		    options.c_cflag |= CRTSCTS;
		    options.c_cc[VSTART] = _POSIX_VDISABLE;
		    options.c_cc[VSTOP] = _POSIX_VDISABLE;
        }
        else if (settings->flowControl == 'd')
        {
		    options.c_iflag &= ~ (IXON|IXOFF);
		    options.c_cflag &= ~CRTSCTS;
		    options.c_cc[VSTART] = _POSIX_VDISABLE;
		    options.c_cc[VSTOP] = _POSIX_VDISABLE;
        }
        else if (settings->flowControl == 'x') {
		    options.c_iflag |= (IXON|IXOFF);
		    options.c_cflag &= ~CRTSCTS;
		    options.c_cc[VSTART] = 0x11 ; // CTRL_Q ; // 0x11 (021) ^q
		    options.c_cc[VSTOP]  = 0x13 ; //CTRL_S ; // 0x13 (023) ^s
        }
    }

    options.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG);
    options.c_oflag &= ~OPOST;

    tcflush(serPort->port, TCIFLUSH);

    if (tcsetattr(serPort->port, TCSANOW, &options) == -1)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    if (saveSettings != 0)
    {
        memcpy(&serPort->originalPortSettings, settings, sizeof(SerPortSettings));
    }

    return PORTCONTROL_ERROR_SUCCESS;
}

static long serOpenPort (char const * portName, char const * portSettings)
{
    SerPort * oldSerPort = serFindPort(portName);
    if (oldSerPort != NULL)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }

    int i = 0;
    for (; i < MAX_COM_PORTS; i++)
    {
        if (serPorts[i].set == 0)
            break;
    }
    if ( i == MAX_COM_PORTS)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    SerPort serPort;

    memset(&serPort, 0x00, sizeof(SerPort));

    serPort.set = 1;

    strcpy(serPort.portSettings, portSettings);

    SerPortSettings settings;
    memset(&settings, 0x00, sizeof(SerPortSettings));

    char * baudToken = serPort.portSettings;
    char * parityToken = NULL;
    char * dataBitsToken = NULL;
    char * stopBitsToken = NULL;
    char * flowControlToken = NULL;

    do
    {
        baudToken = serPort.portSettings;
        if ((parityToken        = strstr(baudToken,         ",")) == NULL) break;
        if ((dataBitsToken      = strstr(++parityToken,     ",")) == NULL) break;
        if ((stopBitsToken      = strstr(++dataBitsToken,   ",")) == NULL) break;
        if ((flowControlToken   = strstr(++stopBitsToken,   ",")) == NULL) break;
        ++flowControlToken;
    } while (0);

    if ((baudToken == NULL) || (parityToken == NULL) || (dataBitsToken == NULL) || (stopBitsToken == NULL) || (flowControlToken == NULL))
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    settings.baud = atol(baudToken);
    if ((settings.baud != 230400) &&
        (settings.baud != 460800) &&
        (settings.baud != 500000) &&
        (settings.baud != 576000) &&
        (settings.baud != 921600) &&
        (settings.baud != 1000000) &&
        (settings.baud != 1152000) &&
        (settings.baud != 1500000) &&
        (settings.baud != 2000000) &&
        (settings.baud != 2500000) &&
        (settings.baud != 3000000) &&
        (settings.baud != 3500000) &&
        (settings.baud != 4000000) &&
        (settings.baud != 115200) &&
        (settings.baud != 38400) &&
        (settings.baud != 19200) &&
        (settings.baud !=  9600) &&
        (settings.baud !=  4800) &&
        (settings.baud !=  2400))
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (strncmp(parityToken, "none", strlen("none")) == 0 || strncmp(parityToken, "n", strlen("n")) == 0)
    {
        settings.parity = 'n';
    }
    else if (strncmp(parityToken, "even", strlen("even")) == 0 || strncmp(parityToken, "e", strlen("e")) == 0)
    {
        settings.parity = 'e';
    }
    else if (strncmp(parityToken, "odd", strlen("odd")) == 0 || strncmp(parityToken, "o", strlen("o")) == 0)
    {
        settings.parity = 'o';
    }
    else
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    settings.dataBits = atol(dataBitsToken);
    if ((settings.dataBits != 8) &&
        (settings.dataBits != 7))
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    settings.stopBits = atol(stopBitsToken);
    if ((settings.stopBits != 1) &&
        (settings.stopBits != 2))
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    if (strncmp(flowControlToken, "none", strlen("none")) == 0 || strncmp(flowControlToken, "n", strlen("n")) == 0)
    {
        settings.flowControl = 'n';
    }
    else if (strncmp(flowControlToken, "hard", strlen("hard")) == 0 || strncmp(flowControlToken, "rtscts", strlen("rtscts")) == 0 || strncmp(flowControlToken, "h", strlen("h")) == 0)
    {
        settings.flowControl = 'h';
    }
    else if (strncmp(flowControlToken, "dtrdsr", strlen("dtrdsr")) == 0 || strncmp(flowControlToken, "h2", strlen("h2")) == 0)
    {
        settings.flowControl = 'd';
    }
    else if (strncmp(flowControlToken, "soft", strlen("soft")) == 0 || strncmp(flowControlToken, "x", strlen("x")) == 0)
    {
        settings.flowControl = 'x';
    }
    else
    {
        return PORTCONTROL_ERROR_NOT_AVAILABLE;
    }

    strcpy(serPort.portName, portName);

    serPort.port = open(serPort.portName, O_RDWR | O_NOCTTY | O_NDELAY);
    if (serPort.port == -1)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    long configureSuccess = serConfigurePort(&serPort, 1, &settings);

    if (configureSuccess != PORTCONTROL_ERROR_SUCCESS)
    {
        close(serPort.port);

        return configureSuccess;
    }

    memcpy(&serPorts[i], &serPort, sizeof(SerPort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static long serWritePort (char const * portName, char const * writeBuffer, long length)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
		// printf("PORTCONTROL_ERROR_NOT_OPEN.. \n");
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    long timeout = 5 * 1000;

    long writeLength = (long) length;
    long totalWriteLength = 0;
    long partialWriteLength = 0;

    char const * bufferElements = writeBuffer;
	int pollRet = 0 ;

	struct pollfd pollSerPort[1];
	
	pollSerPort[0].fd = serPort->port;
	pollSerPort[0].events = POLLOUT;

    int blockSize = (int) ceil(serPort->originalPortSettings.baud/2400*4);
    blockSize = blockSize > 2048 ? 2048 : blockSize; // limit size to 2K
    int writeSize = 0;
    // printf("baud = %d, total = %d, blockSize = %d , flow = %c \n", serPort->originalPortSettings.baud, length, blockSize, serPort->originalPortSettings.flowControl);
	
    while ((totalWriteLength < writeLength) && (timeout > 0))
    {

		// check hardware state for DSR OR CTS
        if (serPort->originalPortSettings.flowControl == 'h' || serPort->originalPortSettings.flowControl == 'd')
        {
            while (timeout > 0)
            {
                int portStatus = 0;
                if (ioctl(serPort->port, TIOCMGET, &portStatus) == 0)
                {
                    if (serPort->originalPortSettings.flowControl == 'h' && (portStatus & TIOCM_CTS) != 0 ) break;
                    if (serPort->originalPortSettings.flowControl == 'd' && (portStatus & TIOCM_DSR) != 0 ) break;
                }
                else
                {
					// printf("PORTCONTROL_ERROR_IO_FAIL.. \n");
                    return PORTCONTROL_ERROR_IO_FAIL;
                }

				/*
                struct timeval sleepTime = {0, 20 * 1000};
                select(0, NULL, NULL, NULL, &sleepTime);
		        */
				poll(NULL, 0, 20);

                if (timeout > 20)
                    timeout -= 20;
                else
                    timeout = 0;
            }
            if (timeout == 0)
            {
                break;
            }
        }
		else if (serPort->originalPortSettings.flowControl == 'x')
		{
			// wait 20ms
			poll(NULL, 0, 20);

		}

		// use poll waiting output available
		//printf("poll serport for waiting 5 secs \n");
		pollRet = poll(pollSerPort, 1, 5 * 1000);
		if( pollRet == 0 || pollRet == -1) {
			// error or timeout
			//printf(" poll timeout %d \n", pollRet);
			break;

		}else if ( (pollSerPort[0].revents & POLLOUT) != 0) {

            writeSize = ((writeLength - totalWriteLength) < blockSize)?(writeLength - totalWriteLength):blockSize;
		
			//printf("poll available to writing.. blockSize: %d , writeSize: %d \n", blockSize, writeSize);

			// write now will not blocking.
			partialWriteLength = write(serPort->port, &bufferElements[totalWriteLength], writeSize);
	
		    if (partialWriteLength == -1) {
				// error to write
				//printf("PORTCONTROL_ERROR_IO_FAIL.. \n");
		        return PORTCONTROL_ERROR_IO_FAIL;
		    }

		    totalWriteLength += partialWriteLength;

			//printf("total %d, partial %d \n", totalWriteLength, partialWriteLength);

//			int portStatus = 0;
//            if (ioctl(serPort->port, TIOCMGET, &portStatus) == 0)
//			{
//                    if ( /*(portStatus & TIOCM_DSR) != 0  ||*/ (portStatus & TIOCM_CTS) != 0 )
//                    {
						//printf("before tcdrain .. \n");
						if (tcdrain(serPort->port) != 0) {
							// error to drain buffer
							//printf("PORTCONTROL_ERROR_IO_FAIL.. \n");
							return PORTCONTROL_ERROR_IO_FAIL;
						}
						//printf("after tcdrain success.. \n");
//                    }
//            }
//            else
//            {
//  				    printf("PORTCONTROL_ERROR_IO_FAIL.. \n");
//                    return PORTCONTROL_ERROR_IO_FAIL;
//            }

		    if (partialWriteLength > 0)
		    {
		        timeout = 5 * 1000;
		    }

		}else {
			// can't write 
			//printf(" poll can't POLLOUT %d \n", pollRet);
			break; 
		}

    }

    return totalWriteLength;
}

static long serReadPortPrv (char const * portName, char * readBuffer, long length, long minLength, long timeMillis)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    int availableReadLength = 0;
    int timeout = timeMillis;

    while (timeout > 0)
    {
        int startingAvailableReadLength = availableReadLength;

        if (ioctl(serPort->port, FIONREAD, &availableReadLength) != 0)
        {
            return PORTCONTROL_ERROR_IO_FAIL;
        }

        if (availableReadLength >= minLength)
        {
            break;
        }

		/*
        struct timeval sleepTime = {0, 20 * 1000};
        select(0, NULL, NULL, NULL, &sleepTime);
		*/
		poll(NULL, 0, 20);

        if (startingAvailableReadLength != availableReadLength)
        {
            timeout = timeMillis;
        }
        else
        {
            if (timeout > 20)
                timeout -= 20;
            else
                timeout = 0;
        }
    }

    if (availableReadLength == 0)
    {
        return 0;
    }

    if (availableReadLength < minLength)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    if (availableReadLength < length)
    {
        length = availableReadLength;
    }

    length = read(serPort->port, readBuffer, length);

    if (length == -1)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    return length;
}

static long serAvailablePort (char const * portName)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    long availableReadLength = 0;

    if (ioctl(serPort->port, FIONREAD, &availableReadLength) != 0)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    return availableReadLength;
    
}

static long serReadPort (char const * portName, char * readBuffer, long length)
{
    if (length == 0)
    {
        return 0;
    }
    return serReadPortPrv(portName, readBuffer, length, 1, 200);
}

static int serStatusPort(char const * portName)
{
	SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    int portStatus = 0;
    if (ioctl(serPort->port, TIOCMGET, &portStatus) == 0) {
    	return portStatus;
    }else {
    	return PORTCONTROL_ERROR_IO_FAIL;
    }
}

static long serHdwrResetDevice (char const * portName)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    do
    {
        unsigned int mstat;

        if (ioctl(serPort->port, TIOCMGET, &mstat))
            break;

        mstat &= ~TIOCM_DTR;

        if (ioctl(serPort->port, TIOCMSET, &mstat))
            break;

		/*
        struct timeval sleepTime = {0, 10 * 1000};
        select(0, NULL, NULL, NULL, &sleepTime);
		*/
		poll(NULL, 0, 10);

        mstat |= TIOCM_DTR;

        if (ioctl(serPort->port, TIOCMSET, &mstat))
            break;

        return PORTCONTROL_ERROR_SUCCESS;
    } while (0);

    return PORTCONTROL_ERROR_IO_FAIL;
}

static long serClosePort (char const * portName)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    tcflush(serPort->port, TCIOFLUSH);

    close(serPort->port);

    memset(serPort, 0x00, sizeof(SerPort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static void serReleaseImpl ()
{
    int i = 0;
    for (; i < MAX_COM_PORTS; i++)
    {
        if (serPorts[i].set != 0)
        {
            serClosePort(serPorts[i].portName);
        }
    }
}

static long serInputFlushPort (char const * portName)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    return tcflush(serPort->port, TCIFLUSH);

}

static long serOutputFlushPort (char const * portName)
{
    SerPort * serPort = serFindPort(portName);
    if (serPort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    return tcflush(serPort->port, TCOFLUSH);
}

