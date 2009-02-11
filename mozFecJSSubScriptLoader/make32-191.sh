#!/bin/sh 
SDK="/home/rack/workspace/xulrunner-build/mozilla-central/dist"
rm -f ~/.vivipos/ssihvbv5.default/xpti.dat
rm -f ~/.vivipos/ssihvbv5.default/compreg.dat
c++ -shared -fno-rtti -fno-exceptions -fshort-wchar -Wl,-z,defs -Os -o fec_jsloader-191.so mozFECJSSubScriptLoader-191.cpp mozFECJSSubScriptLoaderModules.cpp \
-L. -ltomcrypt -L ${SDK}/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-L ${SDK}/bin -lmozjs \
-I ${SDK}/include/nspr -I ${SDK}/include/nss \
-I ${SDK}/include/xpcom -I ${SDK}/include/string \
-I ${SDK}/include/xpconnect -I ${SDK}/include/js \
-I ${SDK}/include/caps -I ${SDK}/include/necko \
-I ./headers/
strip fec_jsloader-191.so;
#cp fec_jsloader-191.so ~/workspace/vivipos_sdk/components/

