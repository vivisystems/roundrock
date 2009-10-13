#!/bin/sh 
SDK="/home/rack/workspace/xulrunner-sdk/1.9.1.1/xulrunner-sdk"
rm -f ~/.vivipos/ssihvbv5.default/xpti.dat
rm -f ~/.vivipos/ssihvbv5.default/compreg.dat
c++ -shared -fno-rtti -fno-exceptions -fshort-wchar -Wl,-z,defs -Os -o fec_jsloader-191.so mozFECJSSubScriptLoader-191.cpp mozFECJSSubScriptLoaderModules.cpp license.o \
-L. -ltomcrypt -lsmbios -ldallas -L ${SDK}/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-L ${SDK}/bin -lmozjs \
-I ${SDK}/include/nspr -I ${SDK}/include/nss \
-I ${SDK}/include/xpcom -I ${SDK}/include/string \
-I ${SDK}/include/xpconnect -I ${SDK}/include/js \
-I ${SDK}/include/caps -I ${SDK}/include/necko \
-I ./headers/
strip fec_jsloader-191.so;
cp fec_jsloader-191.so ~/workspace/vivipos_sdk/components/

c++ -shared -fno-rtti -fno-exceptions -fshort-wchar -Wl,-z,defs -DDEBUG -DDEBUG_rginda -Os -o fec_jsloader-191_dgb.so mozFECJSSubScriptLoader-191.cpp mozFECJSSubScriptLoaderModules.cpp license.o \
-L. -ltomcrypt -lsmbios -ldallas -L ${SDK}/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-L ${SDK}/bin -lmozjs \
-I ${SDK}/include/nspr -I ${SDK}/include/nss \
-I ${SDK}/include/xpcom -I ${SDK}/include/string \
-I ${SDK}/include/xpconnect -I ${SDK}/include/js \
-I ${SDK}/include/caps -I ${SDK}/include/necko \
-I ./headers/
strip fec_jsloader-191_dgb.so;
