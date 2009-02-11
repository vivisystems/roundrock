#include "nsIGenericFactory.h"
#include "mozFECJSSubScriptLoader.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(mozFECJSSubScriptLoader)

static nsModuleComponentInfo components[] =
{
  { "FECJSsubscriptloader",    // a message to display when component is loaded
	MOZ_FECJSSUBSCRIPTLOADER_CID,           // our UUID
	mozFECJSSubScriptLoaderContractID,    // our human readable PROGID or CLSID
	mozFECJSSubScriptLoaderConstructor
  }
};
NS_IMPL_NSGETMODULE("FECJSSubScriptLoader", components)
