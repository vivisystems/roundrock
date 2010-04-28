#include "nsIGenericFactory.h"
#include "nsFilePortControlUnix.h"
#include "nsSerialPortControlUnix.h"
#include "nsParallelPortControlUnix.h"
#include "nsIOPortControlUnix.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(nsFilePortControlUnix)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsSerialPortControlUnix)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsParallelPortControlUnix)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsIOPortControlUnix)

static nsModuleComponentInfo components[] =
{
  { "FEC_FilePortControlUnix",    // a message to display when component is loaded
	NS_FILEPORTCONTROLUNIX_CID,           // our UUID
	NS_FILEPORTCONTROLUNIX_CONTRACTID,    // our human readable PROGID or CLSID
	nsFilePortControlUnixConstructor
  },
  { "FEC_SerialPortControlUnix",    // a message to display when component is loaded
	NS_SERIALPORTCONTROLUNIX_CID,           // our UUID
	NS_SERIALPORTCONTROLUNIX_CONTRACTID,    // our human readable PROGID or CLSID
	nsSerialPortControlUnixConstructor,
  },
  { "FEC_ParallelPortControlUnix",    // a message to display when component is loaded
	NS_PARALLELPORTCONTROLUNIX_CID,           // our UUID
	NS_PARALLELPORTCONTROLUNIX_CONTRACTID,    // our human readable PROGID or CLSID
	nsParallelPortControlUnixConstructor,
  },
  { "FEC_IOPortControlUnix",    // a message to display when component is loaded
	NS_IOPORTCONTROLUNIX_CID,           // our UUID
	NS_IOPORTCONTROLUNIX_CONTRACTID,    // our human readable PROGID or CLSID
	nsIOPortControlUnixConstructor
  }  
};
NS_IMPL_NSGETMODULE("PortControlUnixModule", components)