#ifndef NSIOPORTCONTROLUNIX_H_
#define NSIOPORTCONTROLUNIX_H_

#include "nsIIOPortControlUnix.h"

#define NS_IOPORTCONTROLUNIX_CID_STR "6BAD2F8C-992B-475a-B790-662A47F5CF7D"

#define NS_IOPORTCONTROLUNIX_CID { 0x6bad2f8c, 0x992b, 0x475a, { 0xb7, 0x90, 0x66, 0x2a, 0x47, 0xf5, 0xcf, 0x7d } }

#define NS_IOPORTCONTROLUNIX_CONTRACTID "@firich.com.tw/io_port_control_unix;1"


class nsIOPortControlUnix : public nsIIOPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIIOPORTCONTROLUNIX

  nsIOPortControlUnix();

private:
  ~nsIOPortControlUnix();

protected:
  /* additional members */
};

#endif /*NSIOPORTCONTROLUNIX_H_*/
