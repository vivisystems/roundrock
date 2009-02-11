#!/bin/sh
REQUIRES=`pkg-config --cflags --libs libnotify x11`
c++ -shared -fno-rtti -fshort-wchar -fno-exceptions -Wl,-z,defs -o fec_notify.so mozFECNotify.cpp mozFECNotifyModules.cpp \
-L /home/rack/workspace/tmp/xulrunner-sdk/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-I /home/rack/workspace/tmp/xulrunner-sdk/sdk/include \
-L . ${REQUIRES}

