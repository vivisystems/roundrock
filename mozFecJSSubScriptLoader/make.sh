#!/bin/sh 
gcc -shared -fPIC -fno-rtti -fno-exceptions -fshort-wchar -o fec_jsloader.so mozFECJSSubScriptLoader.cpp mozFECJSSubScriptLoaderModules.cpp -L /usr/lib/xulrunner-devel-1.9.0.4/lib -lxpcomglue_s -lmozjs -lxpcom -lplc4 -lnspr4 -lplds4 -I /usr/lib/xulrunner-devel-1.9.0.4/include -I /usr/include/nspr/
