/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsIFilePortControlUnix.idl
 */

#ifndef __gen_nsIFilePortControlUnix_h__
#define __gen_nsIFilePortControlUnix_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIFilePortControlUnix */
#define NS_IFILEPORTCONTROLUNIX_IID_STR "d1bdbe18-14a6-4253-9548-49fbed8e6370"

#define NS_IFILEPORTCONTROLUNIX_IID \
  {0xd1bdbe18, 0x14a6, 0x4253, \
    { 0x95, 0x48, 0x49, 0xfb, 0xed, 0x8e, 0x63, 0x70 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIFilePortControlUnix : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IFILEPORTCONTROLUNIX_IID)

  /* PRInt64 openPort (in AString portName, in AString portSettings); */
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) = 0;

  /* PRInt64 closePort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) = 0;

  /* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) = 0;

  /* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) = 0;

  /* PRInt32 statusPort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) = 0;

  /* PRInt64 hdwrResetDevice (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIFilePortControlUnix, NS_IFILEPORTCONTROLUNIX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIFILEPORTCONTROLUNIX \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIFILEPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return _to OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return _to ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return _to WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return _to ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return _to StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return _to HdwrResetDevice(portName, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIFILEPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HdwrResetDevice(portName, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsFilePortControlUnix : public nsIFilePortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIFILEPORTCONTROLUNIX

  nsFilePortControlUnix();

private:
  ~nsFilePortControlUnix();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsFilePortControlUnix, nsIFilePortControlUnix)

nsFilePortControlUnix::nsFilePortControlUnix()
{
  /* member initializers and constructor code */
}

nsFilePortControlUnix::~nsFilePortControlUnix()
{
  /* destructor code */
}

/* PRInt64 openPort (in AString portName, in AString portSettings); */
NS_IMETHODIMP nsFilePortControlUnix::OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 closePort (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::ClosePort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
NS_IMETHODIMP nsFilePortControlUnix::WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
NS_IMETHODIMP nsFilePortControlUnix::ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 statusPort (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::StatusPort(const nsAString & portName, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 hdwrResetDevice (in AString portName); */
NS_IMETHODIMP nsFilePortControlUnix::HdwrResetDevice(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIFilePortControlUnix_h__ */
