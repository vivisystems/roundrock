#!/bin/sh 
SDK="/home/rack/workspace/xulrunner-sdk/1.9.0.4"
rm -f ~/.vivipos/ssihvbv5.default/xpti.dat
rm -f ~/.vivipos/ssihvbv5.default/compreg.dat
c++ -shared -fno-rtti -fno-exceptions -fshort-wchar -Wl,-z,defs -Os -o fec_jsloader.so mozFECJSSubScriptLoader.cpp mozFECJSSubScriptLoaderModules.cpp license.o \
-L. -ltomcrypt -lsmbios -ldallas -L ${SDK}/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-L ${SDK}/bin -lmozjs \
-I ${SDK}/include/nspr -I ${SDK}/include/nss \
-I ${SDK}/include/xpcom -I ${SDK}/include/string \
-I ${SDK}/include/xpconnect -I ${SDK}/include/js \
-I ${SDK}/include/caps -I ${SDK}/include/necko \
-I ./headers/
strip fec_jsloader.so;
cp fec_jsloader.so ~/workspace/vivipos_sdk/components/

c++ -shared -fno-rtti -fno-exceptions -fshort-wchar -Wl,-z,defs -DDEBUG -Os -o fec_jsloader_dbg.so mozFECJSSubScriptLoader.cpp mozFECJSSubScriptLoaderModules.cpp license.o \
-L. -ltomcrypt -lsmbios -ldallas -L ${SDK}/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-L ${SDK}/bin -lmozjs \
-I ${SDK}/include/nspr -I ${SDK}/include/nss \
-I ${SDK}/include/xpcom -I ${SDK}/include/string \
-I ${SDK}/include/xpconnect -I ${SDK}/include/js \
-I ${SDK}/include/caps -I ${SDK}/include/necko \
-I ./headers/
strip fec_jsloader_dbg.so;
