/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM nsIIOPortControlUnix.idl
 */

#ifndef __gen_nsIIOPortControlUnix_h__
#define __gen_nsIIOPortControlUnix_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    nsIIOPortControlUnix */
#define NS_IIOPORTCONTROLUNIX_IID_STR "1e887b6d-1d7e-4e66-9b14-ca4dacae9996"

#define NS_IIOPORTCONTROLUNIX_IID \
  {0x1e887b6d, 0x1d7e, 0x4e66, \
    { 0x9b, 0x14, 0xca, 0x4d, 0xac, 0xae, 0x99, 0x96 }}

class NS_NO_VTABLE NS_SCRIPTABLE nsIIOPortControlUnix : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(NS_IIOPORTCONTROLUNIX_IID)

  /* PRInt32 usleep (in PRInt32 time); */
  NS_SCRIPTABLE NS_IMETHOD Usleep(PRInt32 time, PRInt32 *_retval) = 0;

  /* PRInt32 iopl (in PRInt32 level); */
  NS_SCRIPTABLE NS_IMETHOD Iopl(PRInt32 level, PRInt32 *_retval) = 0;

  /* PRInt16 inb (in PRInt32 portBaseAddr); */
  NS_SCRIPTABLE NS_IMETHOD Inb(PRInt32 portBaseAddr, PRInt16 *_retval) = 0;

  /* PRInt16 inw (in PRInt32 portBaseAddr); */
  NS_SCRIPTABLE NS_IMETHOD Inw(PRInt32 portBaseAddr, PRInt16 *_retval) = 0;

  /* PRInt32 outb (in PRInt32 portBaseAddr, in PRInt16 data); */
  NS_SCRIPTABLE NS_IMETHOD Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) = 0;

  /* PRInt32 outw (in PRInt32 portBaseAddr, in PRInt16 data); */
  NS_SCRIPTABLE NS_IMETHOD Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(nsIIOPortControlUnix, NS_IIOPORTCONTROLUNIX_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_NSIIOPORTCONTROLUNIX \
  NS_SCRIPTABLE NS_IMETHOD Usleep(PRInt32 time, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Iopl(PRInt32 level, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Inb(PRInt32 portBaseAddr, PRInt16 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Inw(PRInt32 portBaseAddr, PRInt16 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval); \
  NS_SCRIPTABLE NS_IMETHOD Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_NSIIOPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD Usleep(PRInt32 time, PRInt32 *_retval) { return _to Usleep(time, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Iopl(PRInt32 level, PRInt32 *_retval) { return _to Iopl(level, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Inb(PRInt32 portBaseAddr, PRInt16 *_retval) { return _to Inb(portBaseAddr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Inw(PRInt32 portBaseAddr, PRInt16 *_retval) { return _to Inw(portBaseAddr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) { return _to Outb(portBaseAddr, data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) { return _to Outw(portBaseAddr, data, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_NSIIOPORTCONTROLUNIX(_to) \
  NS_SCRIPTABLE NS_IMETHOD Usleep(PRInt32 time, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Usleep(time, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Iopl(PRInt32 level, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Iopl(level, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Inb(PRInt32 portBaseAddr, PRInt16 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Inb(portBaseAddr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Inw(PRInt32 portBaseAddr, PRInt16 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Inw(portBaseAddr, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Outb(portBaseAddr, data, _retval); } \
  NS_SCRIPTABLE NS_IMETHOD Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Outw(portBaseAddr, data, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class nsIOPortControlUnix : public nsIIOPortControlUnix
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIIOPORTCONTROLUNIX

  nsIOPortControlUnix();

private:
  ~nsIOPortControlUnix();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(nsIOPortControlUnix, nsIIOPortControlUnix)

nsIOPortControlUnix::nsIOPortControlUnix()
{
  /* member initializers and constructor code */
}

nsIOPortControlUnix::~nsIOPortControlUnix()
{
  /* destructor code */
}

/* PRInt32 usleep (in PRInt32 time); */
NS_IMETHODIMP nsIOPortControlUnix::Usleep(PRInt32 time, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 iopl (in PRInt32 level); */
NS_IMETHODIMP nsIOPortControlUnix::Iopl(PRInt32 level, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt16 inb (in PRInt32 portBaseAddr); */
NS_IMETHODIMP nsIOPortControlUnix::Inb(PRInt32 portBaseAddr, PRInt16 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt16 inw (in PRInt32 portBaseAddr); */
NS_IMETHODIMP nsIOPortControlUnix::Inw(PRInt32 portBaseAddr, PRInt16 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 outb (in PRInt32 portBaseAddr, in PRInt16 data); */
NS_IMETHODIMP nsIOPortControlUnix::Outb(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* PRInt32 outw (in PRInt32 portBaseAddr, in PRInt16 data); */
NS_IMETHODIMP nsIOPortControlUnix::Outw(PRInt32 portBaseAddr, PRInt16 data, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_nsIIOPortControlUnix_h__ */
