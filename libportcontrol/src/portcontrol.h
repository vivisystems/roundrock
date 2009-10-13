#ifndef PORTCONTROL_H_
#define PORTCONTROL_H_

#include "portcontrol-error.h"
#include "portcontrol-structures.h"

#ifdef __cplusplus
extern "C" {
#endif

void portControlInit(void);
void portControlDestroy(void);

/*
    openPort
    --------
    This function opens a connection to the port specified.

    Parameters: portName - string of the form "usb:TSP700;sn:12345678", or "/dev/ttyS0", or "/dev/parport0" (usb, serial, and parallel respectively)
                portSettings - string of the form "", or "9600,none,8,1,hdwr", or "" (respective to portName parameter)
    Returns:    STARIO_ERROR_SUCCESS
                    or
    Errors:     STARIO_ERROR_NOT_OPEN - device not present, wrong serial number, libusb failure
    Notes:      In the case of USB, the portName parameter can optionally contain
                a serial number.  If a serial number is specified, this function
                will succeed only when the specified device type configured
                with the specified serial number is present on a USB bus.

                In the case of serial, the portSettings string contains the
                following fields:
                    baud: 38400, 19200, 9600, 4800, 2400
                    parity: none, even, odd
                    data-bits: 8, 7
                    stop-bits: 1
                    flow-ctrl: none, hdwr
*/
long openPort (char const * portName, char const * portSettings);

/*
    closePort
    ---------
    This function closes the device connection - no further communications
    are possible via this connection.  Call openPort to re-establish a
    connection

    Parameters: portName - string of the form "usb:TSP700", or ...
    Returns:    STARIO_ERROR_SUCCESS
*/
long closePort (char const * portName);




// printer api

/*
    writePort
    ---------
    This function writes the provided buffer length out to the usb device.
    If the device fails to accept data during the write sequence for
    longer then a fixed timeout period, then this function times out.

    Parameters: portName - string of the form "usb:TSP700", or ...
                writeBuffer - pointer to a char array
                length - length in bytes of writeBuffer
    Returns:    number of bytes written successfully >= 0
                    or
    Errors:     STARIO_ERROR_NOT_OPEN - device not opened or no longer present
*/
long writePort (char const * portName, char const * writeBuffer, long length);

/*
    readPort
    --------
    This function the requested (or fewer) number of bytes
    in from the device, placing them in the provided buffer.

    Parameters: portName - string of the form "usb:TSP700", or ...
                readBuffer - pointer to a char array
                length - read request length in bytes
    Returns:    number of bytes read successfully >= 0
                    or
    Errors:     STARIO_ERROR_NOT_OPEN - device not opened or no longer present
                STARIO_ERROR_IO_FAIL - communications problem
*/
long readPort (char const * portName, char * readBuffer, long length);

/*
    statusPort
    --------------------
    This function reads in the printers current status and
    parses that status into the provided StarPrinterStatus structure.

    Parameters: portName - string of the form "usb:TSP700", or ...
                status - pointer to a StarPrinterStatus structure
    Returns:    IOCTL STATUS
                    or
    Errors:     STARIO_ERROR_NOT_OPEN - device not opened or no longer present
                STARIO_ERROR_IO_FAIL - communications problem
*/
int statusPort (const char * portName);


/*
    hdwrResetDevice
    ---------------
    This function hardware resets the device.

    Parameters: portName - string of the form "usb:TSP700", or ...
    Returns:    STARIO_ERROR_SUCCESS
                    or
    Errors:     STARIO_ERROR_NOT_OPEN - device not opened or no longer present
                STARIO_ERROR_IO_FAIL - communications problem
*/
long hdwrResetDevice (char const * portName);


#ifdef __cplusplus
}
#endif


#endif /*PORTCONTROL_H_*/
