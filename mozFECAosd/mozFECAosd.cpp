#include "mozFECAosd.h"

#include <stdio.h>

#include <cairo/cairo.h>
#include <pango/pangocairo.h>
#include <time.h>
#include <unistd.h>

#include <X11/Xlib.h>

#include <libaosd/aosd.h>
#include <libaosd/aosd-text.h>

NS_IMPL_ISUPPORTS1(mozFECAosd, mozIFECAosd)

mozFECAosd::mozFECAosd()
{
  /* member initializers and constructor code */
}

mozFECAosd::~mozFECAosd()
{
  /* destructor code */
}

/* void osdText (in AString markup, in PRInt32 posX, in PRInt32 posY, in PRInt32 fade_ms, in PRInt32 total_display_ms, in PRInt32 transparency); */
NS_IMETHODIMP mozFECAosd::OsdText(const nsAString & markup, PRInt32 posX, PRInt32 posY, PRInt32 fade_ms, PRInt32 total_display_ms, PRInt32 transparency)
{


  Aosd* aosd;

  aosd = aosd_new_text(
      NS_ConvertUTF16toUTF8(markup).get(),
      posX, posY);

  aosd_set_transparency(aosd, (AosdTransparency) transparency);

  aosd_flash(aosd, fade_ms, total_display_ms);

  aosd_destroy(aosd);

  #ifdef DEBUG
  printf(NS_ConvertUTF16toUTF8(markup).get());
  #endif
  return NS_OK;
}


