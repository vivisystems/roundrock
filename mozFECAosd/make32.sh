#!/bin/sh
REQUIRES=`pkg-config --cflags --libs pango cairo pangocairo xcomposite`
c++ -shared -fno-rtti -fshort-wchar -fno-exceptions -Wl,-z,defs -o fec_aosd.so mozFECAosd.cpp mozFECAosdModules.cpp \
-L /home/rack/workspace/tmp/xulrunner-sdk/sdk/lib -lxpcomglue_s -lxpcom -lplc4 -lnspr4 -lplds4 \
-I /home/rack/workspace/tmp/xulrunner-sdk/sdk/include \
${REQUIRES} \
-I ./libs -L ./libs -laosd -lX11 -lXrender
c++ -fno-rtti -fshort-wchar -fno-exceptions -Wl,-z,defs -o text text.c \
${REQUIRES} \
-I ./libs -L ./libs -laosd
