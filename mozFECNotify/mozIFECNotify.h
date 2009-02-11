/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM mozIFECNotify.idl
 */

#ifndef __gen_mozIFECNotify_h__
#define __gen_mozIFECNotify_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#include "nsStringAPI.h"

/* starting interface:    mozIFECNotify */
#define MOZIFECNOTIFY_IID_STR "f9911196-8164-44ee-99d3-6337cf41961e"

#define MOZIFECNOTIFY_IID \
  {0xf9911196, 0x8164, 0x44ee, \
    { 0x99, 0xd3, 0x63, 0x37, 0xcf, 0x41, 0x96, 0x1e }}

class NS_NO_VTABLE NS_SCRIPTABLE mozIFECNotify : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(MOZIFECNOTIFY_IID)

  enum { URGENCY_LOW = 0 };

  enum { URGENCY_NORMAL = 1 };

  enum { URGENCY_CRITICAL = 2 };

  /**
     * notify
     *
     */
  /* boolean notify (in AString summary, in AString body, in AString icon, in PRInt32 total_display_ms, in PRInt32 urgency); */
  NS_SCRIPTABLE NS_IMETHOD Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(mozIFECNotify, MOZIFECNOTIFY_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_MOZIFECNOTIFY \
  NS_SCRIPTABLE NS_IMETHOD Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_MOZIFECNOTIFY(_to) \
  NS_SCRIPTABLE NS_IMETHOD Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval) { return _to Notify(summary, body, icon, total_display_ms, urgency, _retval); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_MOZIFECNOTIFY(_to) \
  NS_SCRIPTABLE NS_IMETHOD Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Notify(summary, body, icon, total_display_ms, urgency, _retval); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public mozIFECNotify
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECNOTIFY

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, mozIFECNotify)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* boolean notify (in AString summary, in AString body, in AString icon, in PRInt32 total_display_ms, in PRInt32 urgency); */
NS_IMETHODIMP _MYCLASS_::Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_mozIFECNotify_h__ */
