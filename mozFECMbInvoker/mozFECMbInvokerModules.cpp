#include "nsIGenericFactory.h"
#include "mozFECMbInvoker.h"


NS_GENERIC_FACTORY_CONSTRUCTOR(mozFECMbInvoker)

static nsModuleComponentInfo components[] =
{
  { "FEC MB Invoker",    // a message to display when component is loaded
	MOZ_FECMBINVOKER_CID,           // our UUID
	mozFECMBINVOKERContractID,    // our human readable PROGID or CLSID
	mozFECMbInvokerConstructor
  }
};
NS_IMPL_NSGETMODULE("FECMBINVOKER", components)
