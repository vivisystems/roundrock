#ifndef NSSERIALPORTCONTROLUNIX_H_
#define NSSERIALPORTCONTROLUNIX_H_

#include "nsISerialPortControlUnix.h"

#include "portcontrol-structures.h"

#define NS_SERIALPORTCONTROLUNIX_CID_STR "11D21064-2885-48eb-A3B3-18E3DDD89237"

#define NS_SERIALPORTCONTROLUNIX_CID { 0x11d21064, 0x2885, 0x48eb, { 0xa3, 0xb3, 0x18, 0xe3, 0xdd, 0xd8, 0x92, 0x37 } }

#define NS_SERIALPORTCONTROLUNIX_CONTRACTID "@firich.com.tw/serial_port_control_unix;1"


class nsSerialPortControlUnix : public nsISerialPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISERIALPORTCONTROLUNIX

  nsSerialPortControlUnix();

private:
  ~nsSerialPortControlUnix();

protected:
  /* additional members */
  PortControlImpl impl;
};


#endif /*NSSERIALPORTCONTROLUNIX_H_*/
