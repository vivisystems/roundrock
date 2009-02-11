#include "nsIGenericFactory.h"
#include "mozFECAosd.h"


NS_GENERIC_FACTORY_CONSTRUCTOR(mozFECAosd)

static nsModuleComponentInfo components[] =
{
  { "FEC AOSD",    // a message to display when component is loaded
	MOZ_FECAOSD_CID,           // our UUID
	mozFECAOSDContractID,    // our human readable PROGID or CLSID
	mozFECAosdConstructor
  }
};
NS_IMPL_NSGETMODULE("FECAOSD", components)
