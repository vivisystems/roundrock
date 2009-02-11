#!/bin/sh
REQUIRES=`pkg-config --cflags --libs gtk+-2.0 x11`
c++ -shared -fno-rtti -fPIC -fshort-wchar -fno-exceptions -Wl,-z,defs -o fec_mbinvoker.so im-protocol.c mozFECMbInvoker.cpp mozFECMbInvokerModules.cpp \
-L /home/rack/workspace/tmp/xulrunner-sdk/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-I /home/rack/workspace/tmp/xulrunner-sdk/sdk/include \
${REQUIRES} -lX11
