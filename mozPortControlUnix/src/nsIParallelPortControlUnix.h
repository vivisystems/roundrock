/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsIParallelPortControlUnix.idl
 */

#ifndef __gen_nsIParallelPortControlUnix_h__
#define __gen_nsIParallelPortControlUnix_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIParallelPortControlUnix */
#define NS_IPARALLELPORTCONTROLUNIX_IID_STR "aaf28d94-0fcc-46ba-9d79-04912b7325e2"

#define NS_IPARALLELPORTCONTROLUNIX_IID \
  {0xaaf28d94, 0x0fcc, 0x46ba, \
    { 0x9d, 0x79, 0x04, 0x91, 0x2b, 0x73, 0x25, 0xe2 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIParallelPortControlUnix : public nsISupports {
 public:

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IPARALLELPORTCONTROLUNIX_IID)

  /* PRInt64 openPort (in AString portName, in AString portSettings); */
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) = 0;

  /* PRInt64 closePort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) = 0;

  /* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) = 0;

  /* PRInt64 availablePort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD AvailablePort(const nsAString & portName, PRInt64 *_retval) = 0;

  /* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) = 0;

  /* PRInt32 statusPort (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) = 0;

  /* PRInt64 hdwrResetDevice (in AString portName); */
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIParallelPortControlUnix, NS_IPARALLELPORTCONTROLUNIX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIPARALLELPORTCONTROLUNIX \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD AvailablePort(const nsAString & portName, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval);

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIPARALLELPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return _to OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return _to ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return _to WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AvailablePort(const nsAString & portName, PRInt64 *_retval) { return _to AvailablePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return _to ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return _to StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return _to HdwrResetDevice(portName, _retval); }

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIPARALLELPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->OpenPort(portName, portSettings, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ClosePort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ClosePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->WritePort(portName, writeBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD AvailablePort(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->AvailablePort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->ReadPort(portName, readBuffer, length, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD StatusPort(const nsAString & portName, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->StatusPort(portName, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD HdwrResetDevice(const nsAString & portName, PRInt64 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->HdwrResetDevice(portName, _retval); }

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsParallelPortControlUnix : public nsIParallelPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIPARALLELPORTCONTROLUNIX

  nsParallelPortControlUnix();

private:
  ~nsParallelPortControlUnix();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsParallelPortControlUnix, nsIParallelPortControlUnix)

nsParallelPortControlUnix::nsParallelPortControlUnix()
{
  /* member initializers and constructor code */
}

nsParallelPortControlUnix::~nsParallelPortControlUnix()
{
  /* destructor code */
}

/* PRInt64 openPort (in AString portName, in AString portSettings); */
NS_IMETHODIMP nsParallelPortControlUnix::OpenPort(const nsAString & portName, const nsAString & portSettings, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 closePort (in AString portName); */
NS_IMETHODIMP nsParallelPortControlUnix::ClosePort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 writePort (in AString portName, in ACString writeBuffer, in PRInt64 length); */
NS_IMETHODIMP nsParallelPortControlUnix::WritePort(const nsAString & portName, const nsACString & writeBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 availablePort (in AString portName); */
NS_IMETHODIMP nsParallelPortControlUnix::AvailablePort(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 readPort (in AString portName, out ACString readBuffer, in PRInt64 length); */
NS_IMETHODIMP nsParallelPortControlUnix::ReadPort(const nsAString & portName, nsACString & readBuffer, PRInt64 length, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 statusPort (in AString portName); */
NS_IMETHODIMP nsParallelPortControlUnix::StatusPort(const nsAString & portName, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt64 hdwrResetDevice (in AString portName); */
NS_IMETHODIMP nsParallelPortControlUnix::HdwrResetDevice(const nsAString & portName, PRInt64 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIParallelPortControlUnix_h__ */
