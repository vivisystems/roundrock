#ifndef NSFILEPORTCONTROLUNIX_H_
#define NSFILEPORTCONTROLUNIX_H_

#include "nsIFilePortControlUnix.h"

#include "portcontrol-structures.h"

#define NS_FILEPORTCONTROLUNIX_CID_STR "AD7493AD-B104-4c03-9291-F90896FE0D4A"

#define NS_FILEPORTCONTROLUNIX_CID { 0xad7493ad, 0xb104, 0x4c03, { 0x92, 0x91, 0xf9, 0x8, 0x96, 0xfe, 0xd, 0x4a } }

#define NS_FILEPORTCONTROLUNIX_CONTRACTID "@firich.com.tw/file_port_control_unix;1"


class nsFilePortControlUnix : public nsIFilePortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIFILEPORTCONTROLUNIX

  nsFilePortControlUnix();

private:
  ~nsFilePortControlUnix();

protected:
  /* additional members */
  PortControlImpl impl;
};

#endif /*NSFILEPORTCONTROLUNIX_H_*/
