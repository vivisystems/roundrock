/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM mozIFECAosd.idl
 */

#ifndef __gen_mozIFECAosd_h__
#define __gen_mozIFECAosd_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif
#include "nsStringAPI.h"

/* starting interface:    mozIFECAosd */
#define MOZIFECAOSD_IID_STR "9ea97f11-8e68-4d70-ba0c-713f6f103b05"

#define MOZIFECAOSD_IID \
  {0x9ea97f11, 0x8e68, 0x4d70, \
    { 0xba, 0x0c, 0x71, 0x3f, 0x6f, 0x10, 0x3b, 0x05 }}

class NS_NO_VTABLE NS_SCRIPTABLE mozIFECAosd : public nsISupports {
 public: 

  NS_DECLARE_STATIC_IID_ACCESSOR(MOZIFECAOSD_IID)

  enum { TRANSPARENCY_NONE = 0 };

  enum { TRANSPARENCY_FAKE = 1 };

  enum { TRANSPARENCY_COMPOSITE = 2 };

  /**
     * Display Text 
     *
     */
  /* void osdText (in AString markup, in PRInt32 posX, in PRInt32 posY, in PRInt32 fade_ms, in PRInt32 total_display_ms, in PRInt32 transparency); */
  NS_SCRIPTABLE NS_IMETHOD OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency) = 0;

};

  NS_DEFINE_STATIC_IID_ACCESSOR(mozIFECAosd, MOZIFECAOSD_IID)

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_MOZIFECAOSD \
  NS_SCRIPTABLE NS_IMETHOD OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency); 

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_MOZIFECAOSD(_to) \
  NS_SCRIPTABLE NS_IMETHOD OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency) { return _to OsdText(markup, posX, posY, fade_ms, total_display_ms, transparency); } 

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_MOZIFECAOSD(_to) \
  NS_SCRIPTABLE NS_IMETHOD OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency) { return !_to ? NS_ERROR_NULL_POINTER : _to->OsdText(markup, posX, posY, fade_ms, total_display_ms, transparency); } 

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public mozIFECAosd
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_MOZIFECAOSD

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, mozIFECAosd)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* void osdText (in AString markup, in PRInt32 posX, in PRInt32 posY, in PRInt32 fade_ms, in PRInt32 total_display_ms, in PRInt32 transparency); */
NS_IMETHODIMP _MYCLASS_::OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_mozIFECAosd_h__ */
