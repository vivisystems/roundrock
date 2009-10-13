#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <memory.h>
#include <string.h>
#include <sys/time.h>
#include <sys/stat.h>

#include "portcontrol-error.h"
#include "portcontrol-file.h"

static long fileMatchPortName        (char const * fileName);
static long fileOpenPort             (char const * fileName, char const * fileSettings);
static long fileWritePort            (char const * fileName, char const * writeBuffer, long length);
static long fileReadPort             (char const * fileName, char * readBuffer, long length);
static long fileClosePort            (char const * fileName);
static int  fileStatusPort			 (char const * fileName);
static long  fileHdwrResetDevice		 (char const * fileName);
static void fileReleaseImpl          ();

FilePort filePorts[MAX_NUM_FILES];

PortControlImpl getFileControlImpl()
{
    memset(filePorts, 0x00, sizeof(filePorts));

    PortControlImpl impl;

    impl.matchPortName          = fileMatchPortName;
    impl.openPort               = fileOpenPort;
    impl.writePort              = fileWritePort;
    impl.readPort               = fileReadPort;
    impl.statusPort				  = fileStatusPort;
    impl.hdwrResetDevice		  = fileHdwrResetDevice;
    impl.closePort              = fileClosePort;
    impl.releaseImpl            = fileReleaseImpl;

    return impl;
}

static FilePort * fileFindPort(char const * fileName)
{
    int i = 0;
    for (; i < MAX_NUM_FILES; i++)
    {
        if (filePorts[i].set != 0)
            if (strcmp(filePorts[i].fileName, fileName) == 0)
                break;
    }

    if (i == MAX_NUM_FILES)
    {
        return NULL;
    }

    return &filePorts[i];
}

static int file_exist(const char *fname) {
	struct stat st;

	if (stat(fname, &st) != 0) {
		return 0;
	}else {
		return 1;
	}
}


static long fileMatchPortName (char const * fileName)
{
    if (file_exist(fileName) == 1)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }
    return PORTCONTROL_ERROR_NOT_AVAILABLE;
}



static long fileOpenPort (char const * fileName, char const * fileSettings)
{
    FilePort * oldFilePort = fileFindPort(fileName);
    if (oldFilePort != NULL)
    {
        return PORTCONTROL_ERROR_SUCCESS;
    }

    int i = 0;
    for (; i < MAX_NUM_FILES; i++)
    {
        if (filePorts[i].set == 0)
            break;
    }
    if ( i == MAX_NUM_FILES)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    FilePort filePort;

    memset(&filePort, 0x00, sizeof(FilePort));

    filePort.set = 1;

    strcpy(filePort.fileSettings, fileSettings);
    strcpy(filePort.fileName, fileName);

    filePort.handle = open(filePort.fileName, O_RDWR);
    if (filePort.handle == -1)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    memcpy(&filePorts[i], &filePort, sizeof(FilePort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static long fileWritePort (char const * fileName, char const * writeBuffer, long length)
{
    FilePort * filePort = fileFindPort(fileName);
    if (filePort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    long timeout = 5 * 1000;

    long writeLength = (long) length;
    long totalWriteLength = 0;
    long partialWriteLength = 0;

    char const * bufferElements = writeBuffer;

    while ((totalWriteLength < writeLength) && (timeout > 0))
    {
        partialWriteLength = write(filePort->handle, &bufferElements[totalWriteLength], (writeLength - totalWriteLength));

        if (partialWriteLength == -1)
        {
            return PORTCONTROL_ERROR_IO_FAIL;
        }

        totalWriteLength += partialWriteLength;

        if (partialWriteLength > 0)
        {
            timeout = 5 * 1000;
        }
    }

    return totalWriteLength;
}


static long fileReadPort (char const * fileName, char * readBuffer, long length)
{
    if (length == 0) return 0;

    FilePort * filePort = fileFindPort(fileName);
    if (filePort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    length = read(filePort->handle, readBuffer, length);

    if (length == -1)
    {
        return PORTCONTROL_ERROR_IO_FAIL;
    }

    return length;

}

static int fileStatusPort (char const * fileName)
{
    FilePort * filePort = fileFindPort(fileName);
    if (filePort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }
    return PORTCONTROL_ERROR_SUCCESS;
}

static long  fileHdwrResetDevice		 (char const * fileName) {

	FilePort * filePort = fileFindPort(fileName);
	if (filePort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }
	return PORTCONTROL_ERROR_SUCCESS;
}

static long fileClosePort (char const * fileName)
{
	FilePort * filePort = fileFindPort(fileName);
	if (filePort == NULL)
    {
        return PORTCONTROL_ERROR_NOT_OPEN;
    }

    close(filePort->handle);

    memset(filePort, 0x00, sizeof(FilePort));

    return PORTCONTROL_ERROR_SUCCESS;
}

static void fileReleaseImpl ()
{
    int i = 0;
    for (; i < MAX_NUM_FILES; i++)
    {
        if (filePorts[i].set != 0)
        {
        	fileClosePort(filePorts[i].fileName);
        }
    }
}
