#include "nsIOPortControlUnix.h"
#include "nsStringAPI.h"
#include <unistd.h>
#include <sys/io.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>

NS_IMPL_ISUPPORTS1(nsIOPortControlUnix, nsIIOPortControlUnix)

nsIOPortControlUnix::nsIOPortControlUnix()
{
    iopl(3);
  /* member initializers and constructor code */
}

nsIOPortControlUnix::~nsIOPortControlUnix()
{
  /* destructor code */
}

/* PRInt32 usleep (in PRInt32 time); */
NS_IMETHODIMP nsIOPortControlUnix::Usleep(PRInt32 time, PRInt32 *_retval)
{
    *_retval = usleep(time);
    return NS_OK;
}

/* PRInt32 iopl (in PRInt32 level); */
NS_IMETHODIMP nsIOPortControlUnix::Iopl(PRInt32 level, PRInt32 *_retval)
{
    if(level >3) level = 3;
    *_retval = iopl(level);
    return NS_OK;
}

/* PRInt16 inb (in PRInt32 portBaseAddr); */
NS_IMETHODIMP nsIOPortControlUnix::Inb(PRInt32 portBaseAddr, PRInt16 *_retval)
{
    *_retval = inb(portBaseAddr);
    return NS_OK;
}

/* PRInt16 inw (in PRInt32 portBaseAddr); */
NS_IMETHODIMP nsIOPortControlUnix::Inw(PRInt32 portBaseAddr, PRInt16 *_retval)
{
    *_retval = inw(portBaseAddr);
    return NS_OK;
}

/* PRInt32 outb (in PRInt32 portBaseAddr, in PRInt16 data); */
NS_IMETHODIMP nsIOPortControlUnix::Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval)
{
    unsigned char data2 = 0;
    data2 = (unsigned char) (data & 0x00ff);
    outb(data2, portBaseAddr);
    return NS_OK;
}

/* PRInt32 outw (in PRInt32 portBaseAddr, in PRInt16 data); */
NS_IMETHODIMP nsIOPortControlUnix::Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval)
{
    outw(data, portBaseAddr);
    return NS_OK;
}