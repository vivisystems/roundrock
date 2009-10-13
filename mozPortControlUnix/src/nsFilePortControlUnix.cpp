#include "nsFilePortControlUnix.h"
#include "portcontrol-file.h"
#include "nsStringAPI.h"
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>

NS_IMPL_ISUPPORTS1(nsFilePortControlUnix, nsIFilePortControlUnix)

nsFilePortControlUnix::nsFilePortControlUnix()
{
  /* member initializers and constructor code */
	impl = getFileControlImpl();
}

nsFilePortControlUnix::~nsFilePortControlUnix()
{
  /* destructor code */
	impl.releaseImpl();
}

/* PRInt64 openPort (in AString portName, in AString portSettings); */
NS_IMETHODIMP nsFilePortControlUnix::OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval)
{
	*_retval = impl.openPort(NS_ConvertUTF16toUTF8(portName).get(), NS_ConvertUTF16toUTF8(portSettings).get());
    return NS_OK;
}

/* PRInt64 closePort (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::ClosePort(const nsAString & portName, PRInt64 *_retval)
{
	*_retval = impl.closePort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

/* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
NS_IMETHODIMP nsFilePortControlUnix::WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval)
{
	*_retval = impl.writePort(NS_ConvertUTF16toUTF8(portName).get(), writeBuffer.BeginReading(), length);
    return NS_OK;
}

/* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
NS_IMETHODIMP nsFilePortControlUnix::ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval)
{
	unsigned char *buf = (unsigned char*)malloc(length+1);
	memset(buf, 0x00, length+1);
	*_retval = impl.readPort(NS_ConvertUTF16toUTF8(portName).get(), (char*)buf, length);
	// readBuffer.Assign((char*)buf);
	NS_CStringSetData(readBuffer, (char*)buf, *_retval);
    return NS_OK;
}

/* PRInt32 statusPort (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::StatusPort(const nsAString & portName, PRInt32 *_retval)
{
    *_retval = impl.statusPort(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}

/* PRInt64 hdwrResetDevice (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::HdwrResetDevice(const nsAString & portName, PRInt64 *_retval)
{
    *_retval = impl.hdwrResetDevice(NS_ConvertUTF16toUTF8(portName).get());
    return NS_OK;
}
