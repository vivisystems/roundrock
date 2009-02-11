#include "mozFECMbInvoker.h"

#include <stdio.h>

#include <X11/Xlib.h>

#include <gtk/gtk.h>
#include <gdk/gdk.h>
#include <gdk/gdkx.h>

#include "matchbox-keyboard-remote.h"
#include "im-protocol.h"

NS_IMPL_ISUPPORTS1(mozFECMbInvoker, mozIFECMbInvoker)

mozFECMbInvoker::mozFECMbInvoker()
{
  /* member initializers and constructor code */
  // initital gtk and gdk
//  printf("init gtk \n");
  gtk_init(0, 0);
}

mozFECMbInvoker::~mozFECMbInvoker()
{
  /* destructor code */
}

/* void show (); */
NS_IMETHODIMP mozFECMbInvoker::Show()
{
//    printf("show = %d \n", MBKeyboardRemoteShow);
    protocol_send_event (MBKeyboardRemoteShow);
    return NS_OK;
}

/* void hide (); */
NS_IMETHODIMP mozFECMbInvoker::Hide()
{
//    printf("hide = %d \n", MBKeyboardRemoteHide);
    protocol_send_event (MBKeyboardRemoteHide);
    return NS_OK;
}

/* void toggle (); */
NS_IMETHODIMP mozFECMbInvoker::Toggle()
{
//    printf("toggle = %d \n", MBKeyboardRemoteToggle);
    protocol_send_event (MBKeyboardRemoteToggle);
    return NS_OK;
}


