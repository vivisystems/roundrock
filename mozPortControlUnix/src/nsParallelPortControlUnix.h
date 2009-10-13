#ifndef NSPARALLELPORTCONTROLUNIX_H_
#define NSPARALLELPORTCONTROLUNIX_H_

#include "nsIParallelPortControlUnix.h"

#include "portcontrol-structures.h"

#define NS_PARALLELPORTCONTROLUNIX_CID_STR "2E524A89-6EF1-457a-AABD-C471D296A720"

#define NS_PARALLELPORTCONTROLUNIX_CID { 0x2e524a89, 0x6ef1, 0x457a, { 0xaa, 0xbd, 0xc4, 0x71, 0xd2, 0x96, 0xa7, 0x20 } }

#define NS_PARALLELPORTCONTROLUNIX_CONTRACTID "@firich.com.tw/parallel_port_control_unix;1"


class nsParallelPortControlUnix : public nsIParallelPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPARALLELPORTCONTROLUNIX

  nsParallelPortControlUnix();

private:
  ~nsParallelPortControlUnix();

protected:
  /* additional members */
  PortControlImpl impl;
};

#endif /*NSPARALLELPORTCONTROLUNIX_H_*/
