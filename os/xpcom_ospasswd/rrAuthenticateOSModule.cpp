#include "nsIGenericFactory.h"
#include "rrAuthenticateOS.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(rrAuthenticateOS)

static nsModuleComponentInfo components[] =
{
    {
       MYCOMPONENT_CLASSNAME,
       MYCOMPONENT_CID,
       MYCOMPONENT_CONTRACTID,
       rrAuthenticateOSConstructor,
    }
};

NS_IMPL_NSGETMODULE("MyComponentsModule", components)
