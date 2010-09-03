C++	= g++
CFLAGS	= -O2

XPCOM_TGT= rr_ospasswd.so
SOURCES	= rrAuthenticatOS.cpp rrAuthenticateOSModule.cpp
OBJECTS	= rrAuthenticateOS.o rrAuthenticateOSModule.o
HEADERS	= rrAuthenticateOS.h

GECKO	= /home/vivipos/Downloads/xulrunner-1.9.1.11-sdk
XPIDL	= $(GECKO)/bin/xpidl
IDLDIR	= $(GECKO)/idl
MYXPCOM	= rrIAuthenticateOS
LIBDIR	= -L$(GECKO)/lib -L$(GECKO)/sdk/lib
XPCOM_LK= $(LIBDIR) -lxpcomglue -lxpcomglue_s -lxpcom
INCLUDES= -I$(GECKO)/include -I$(GECKO)/sdk/include

default:	idl $(XPCOM_TGT)

idl:		$(MYXPCOM).h $(MYXPCOM).xpt

.cpp.o:		$(MYXPCOM).h $(HEADERS)
		$(C++) $(CFLAGS) $(INCLUDES) -c $<

$(XPCOM_TGT):	$(OBJECTS)
		$(C++) -shared -o $@ $(OBJECTS) -lcrypt $(XPCOM_LK)

$(MYXPCOM).h:	$(MYXPCOM).idl
		$(XPIDL) -m header -I $(IDLDIR) $<

$(MYXPCOM).xpt:	$(MYXPCOM).idl
		$(XPIDL) -m typelib -I $(IDLDIR) $<

clean:		
		rm -f $(BINARIES) $(OBJECTS) $(XPCOM_TGT)

realclean:
		rm -f $(BINARIES) $(OBJECTS) $(XPCOM_TGT) $(MYXPCOM).xpt $(MYXPCOM).h $(SOURCES) $(HEADERS)
