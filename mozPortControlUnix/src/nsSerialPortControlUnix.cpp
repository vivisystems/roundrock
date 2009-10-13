#include "nsSerialPortControlUnix.h"
#include "portcontrol-serial.h"
#include "nsStringAPI.h"
#include <unistd.h>
#include <stdlib.h>


NS_IMPL_ISUPPORTS1(nsSerialPortControlUnix, nsISerialPortControlUnix)

nsSerialPortControlUnix::nsSerialPortControlUnix()
{
  /* member initializers and constructor code */
  impl = getSerPortControlImpl();
}

nsSerialPortControlUnix::~nsSerialPortControlUnix()
{
  /* destructor code */
  impl.releaseImpl();
}

/* PRInt64 openPort (in AString portName, in AString portSettings); */
NS_IMETHODIMP nsSerialPortControlUnix::OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval)
{
    *_retval = impl.openPort(NS_ConvertUTF16toUTF8(portName).get(), NS_ConvertUTF16toUTF8(portSettings).get());
    return NS_OK;
}

/* PRInt64 closePort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::ClosePort(const nsAString & portName, PRInt64 *_retval)
{
    *_retval = impl.closePort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

/* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
NS_IMETHODIMP nsSerialPortControlUnix::WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval)
{
    *_retval = impl.writePort(NS_ConvertUTF16toUTF8(portName).get(), writeBuffer.BeginReading(), length);
    return NS_OK;
}

/* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
NS_IMETHODIMP nsSerialPortControlUnix::ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval)
{
   	unsigned char *buf = (unsigned char*)malloc(length+1);
	memset(buf, 0x00, length+1);
	*_retval = impl.readPort(NS_ConvertUTF16toUTF8(portName).get(), (char*)buf, length);
	NS_CStringSetData(readBuffer, (char*)buf, *_retval);
	// readBuffer.Assign((char*)buf);
    return NS_OK;
}

/* PRInt32 statusPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::StatusPort(const nsAString & portName, PRInt32 *_retval)
{
    *_retval = impl.statusPort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

/* PRInt64 hdwrResetDevice (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::HdwrResetDevice(const nsAString & portName, PRInt64 *_retval)
{
    *_retval = impl.hdwrResetDevice(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}
/* PRInt64 inputFlushPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::InputFlushPort(const nsAString & portName, PRInt64 *_retval)
{
    *_retval = impl.inputFlushPort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

/* PRInt64 outputFlushPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::OutputFlushPort(const nsAString & portName, PRInt64 *_retval)
{
    *_retval = impl.outputFlushPort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

