/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsISerialPortControlUnix.idl
 */

#ifndef __gen_nsISerialPortControlUnix_h__
#define __gen_nsISerialPortControlUnix_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsISerialPortControlUnix */
#define NS_ISERIALPORTCONTROLUNIX_IID_STR "b0406e1d-3e20-428b-8e2a-35364527aa92"

#define NS_ISERIALPORTCONTROLUNIX_IID \
  {0xb0406e1d, 0x3e20, 0x428b, \
    { 0x8e, 0x2a, 0x35, 0x36, 0x45, 0x27, 0xaa, 0x92 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsISerialPortControlUnix : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_ISERIALPORTCONTROLUNIX_IID)

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

  /* PRInt64 inputFlushPort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD InputFlushPort(const nsAString & portName, PRInt64 *_retval) = 0;

  /* PRInt64 outputFlushPort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD OutputFlushPort(const nsAString & portName, PRInt64 *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsISerialPortControlUnix, NS_ISERIALPORTCONTROLUNIX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSISERIALPORTCONTROLUNIX \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD InputFlushPort(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD OutputFlushPort(const nsAString & portName, PRInt64 *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSISERIALPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return _to OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return _to ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return _to WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return _to ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return _to StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return _to HdwrResetDevice(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD InputFlushPort(const nsAString & portName, PRInt64 *_retval) { return _to InputFlushPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OutputFlushPort(const nsAString & portName, PRInt64 *_retval) { return _to OutputFlushPort(portName, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSISERIALPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HdwrResetDevice(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD InputFlushPort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->InputFlushPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD OutputFlushPort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OutputFlushPort(portName, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsSerialPortControlUnix : public nsISerialPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSISERIALPORTCONTROLUNIX

  nsSerialPortControlUnix();

private:
  ~nsSerialPortControlUnix();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsSerialPortControlUnix, nsISerialPortControlUnix)

nsSerialPortControlUnix::nsSerialPortControlUnix()
{
  /* member initializers and constructor code */
}

nsSerialPortControlUnix::~nsSerialPortControlUnix()
{
  /* destructor code */
}

/* PRInt64 openPort (in AString portName, in AString portSettings); */
NS_IMETHODIMP nsSerialPortControlUnix::OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 closePort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::ClosePort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
NS_IMETHODIMP nsSerialPortControlUnix::WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
NS_IMETHODIMP nsSerialPortControlUnix::ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 statusPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::StatusPort(const nsAString & portName, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 hdwrResetDevice (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::HdwrResetDevice(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 inputFlushPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::InputFlushPort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 outputFlushPort (in AString portName); */
NS_IMETHODIMP nsSerialPortControlUnix::OutputFlushPort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsISerialPortControlUnix_h__ */
