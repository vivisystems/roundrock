/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM rrIAuthenticateOS.idl
 */

#ifndef __gen_rrIAuthenticateOS_h__
#define __gen_rrIAuthenticateOS_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    rrIAuthenticateOS */
#define RRIAUTHENTICATEOS_IID_STR "fc06fc07-7ba3-47f4-8d45-909d9ea4fe41"

#define RRIAUTHENTICATEOS_IID \
  {0xfc06fc07, 0x7ba3, 0x47f4, \
    { 0x8d, 0x45, 0x90, 0x9d, 0x9e, 0xa4, 0xfe, 0x41 }}

class NS_NO_VTABLE NS_SCRIPTABLE rrIAuthenticateOS : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(RRIAUTHENTICATEOS_IID)

  /* boolean authenticate (in string user, in string passwd); */
  NS_SCRIPTABLE NS_IMETHOD Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(rrIAuthenticateOS, RRIAUTHENTICATEOS_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_RRIAUTHENTICATEOS \
  NS_SCRIPTABLE NS_IMETHOD Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_RRIAUTHENTICATEOS(_to) \
  NS_SCRIPTABLE NS_IMETHOD Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM) { return _to Authenticate(user, passwd, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_RRIAUTHENTICATEOS(_to) \
  NS_SCRIPTABLE NS_IMETHOD Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM) { return !_to ? NS_ERROR_NULL_POINTER : _to->Authenticate(user, passwd, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class rrAuthenticateOS : public rrIAuthenticateOS
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_RRIAUTHENTICATEOS

  rrAuthenticateOS();

private:
  ~rrAuthenticateOS();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(rrAuthenticateOS, rrIAuthenticateOS)

rrAuthenticateOS::rrAuthenticateOS()
{
  /* member initializers and constructor code */
}

rrAuthenticateOS::~rrAuthenticateOS()
{
  /* destructor code */
}

/* boolean authenticate (in string user, in string passwd); */
NS_IMETHODIMP rrAuthenticateOS::Authenticate(const char *user, const char *passwd, PRBool *_retval NS_OUTPARAM)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_rrIAuthenticateOS_h__ */
