/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM mozIFECMbInvoker.idl
 */

#ifndef __gen_mozIFECMbInvoker_h__
#define __gen_mozIFECMbInvoker_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#include "nsStringAPI.h"

/* starting interface:    mozIFECMbInvoker */
#define MOZIFECMBINVOKER_IID_STR "e8fa5e9b-47bf-4e7b-935b-3c5bd88a7c49"

#define MOZIFECMBINVOKER_IID \
  {0xe8fa5e9b, 0x47bf, 0x4e7b, \
    { 0x93, 0x5b, 0x3c, 0x5b, 0xd8, 0x8a, 0x7c, 0x49 }}

class NS_NO_VTABLE NS_SCRIPTABLE mozIFECMbInvoker : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(MOZIFECMBINVOKER_IID)

  enum { REMOTE_NONE = 0 };

  enum { REMOTE_SHOW = 1 };

  enum { REMOTE_HIDE = 2 };

  enum { REMOTE_TOGGLE = 3 };

  /**
     * Display mb keyboard
     *
     */
  /* void show (); */
  NS_SCRIPTABLE NS_IMETHOD Show(void) = 0;

  /**
     * hide mb keyboard
     *
     */
  /* void hide (); */
  NS_SCRIPTABLE NS_IMETHOD Hide(void) = 0;

  /**
     * toggle mb keyboard
     *
     */
  /* void toggle (); */
  NS_SCRIPTABLE NS_IMETHOD Toggle(void) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(mozIFECMbInvoker, MOZIFECMBINVOKER_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_MOZIFECMBINVOKER \
  NS_SCRIPTABLE NS_IMETHOD Show(void); \
  NS_SCRIPTABLE NS_IMETHOD Hide(void); \
  NS_SCRIPTABLE NS_IMETHOD Toggle(void); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_MOZIFECMBINVOKER(_to) \
  NS_SCRIPTABLE NS_IMETHOD Show(void) { return _to Show(); } \
  NS_SCRIPTABLE NS_IMETHOD Hide(void) { return _to Hide(); } \
  NS_SCRIPTABLE NS_IMETHOD Toggle(void) { return _to Toggle(); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_MOZIFECMBINVOKER(_to) \
  NS_SCRIPTABLE NS_IMETHOD Show(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Show(); } \
  NS_SCRIPTABLE NS_IMETHOD Hide(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Hide(); } \
  NS_SCRIPTABLE NS_IMETHOD Toggle(void) { return !_to ? NS_ERROR_NULL_POINTER : _to->Toggle(); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public mozIFECMbInvoker
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECMBINVOKER

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, mozIFECMbInvoker)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void show (); */
NS_IMETHODIMP _MYCLASS_::Show()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void hide (); */
NS_IMETHODIMP _MYCLASS_::Hide()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* void toggle (); */
NS_IMETHODIMP _MYCLASS_::Toggle()
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_mozIFECMbInvoker_h__ */
