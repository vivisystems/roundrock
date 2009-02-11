#include "nsIGenericFactory.h"
#include "mozFECNotify.h"


NS_GENERIC_FACTORY_CONSTRUCTOR(mozFECNotify)

static nsModuleComponentInfo components[] =
{
  { "FEC NOTIFY SEND",    // a message to display when component is loaded
	MOZ_FECNOTIFY_CID,           // our UUID
	MOZ_FECNOTIFY_CONSTRACT_ID,  // our human readable PROGID or CLSID
	mozFECNotifyConstructor
  }
};
NS_IMPL_NSGETMODULE("FECNOTIFY", components)
