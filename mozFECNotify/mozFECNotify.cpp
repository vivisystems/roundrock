#include "mozFECNotify.h"

#include <libnotify/notify.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <errno.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>
#include <fcntl.h>

#include <glib.h>
#include <gtk/gtk.h>
#include <dbus/dbus.h>
#include <dbus/dbus-glib.h>
#include <dbus/dbus-glib-lowlevel.h>

NS_IMPL_ISUPPORTS1(mozFECNotify, mozIFECNotify)

mozFECNotify::mozFECNotify()
{
  /* member initializers and constructor code */
  gtk_init(0, 0);

  isNotifyInit = 0;
  if (!notify_init("FEC-NOTIFY")){
    isNotifyInit= 0;
  }

  isNotifyInit = 1;

}

mozFECNotify::~mozFECNotify()
{
  /* destructor code */
  notify_uninit();
}

/* boolean notify (in AString summary, in AString body, in AString icon, in PRInt32 total_display_ms, in PRInt32 urgency); */
NS_IMETHODIMP mozFECNotify::Notify(const nsAString & summary, const nsAString & body, const nsAString & icon, PRInt32 total_display_ms, PRInt32 urgency, PRBool *_retval)
{

	if (isNotifyInit == 0) {
		*_retval = FALSE;
		return NS_OK;
	}

	NotifyNotification *n = 0;
	//	char *uri;

	/* Stock icon */
	n = notify_notification_new( NS_ConvertUTF16toUTF8(summary).get(), NS_ConvertUTF16toUTF8(body).get(),
				     NS_ConvertUTF16toUTF8(icon).get(), NULL);


	if (!n) {
		*_retval = FALSE;
		return NS_OK;
	}

	notify_notification_set_timeout (n, total_display_ms); 

        switch(urgency) {
		case URGENCY_LOW:
			notify_notification_set_urgency(n, NOTIFY_URGENCY_LOW);
			break;

		default:
		case URGENCY_NORMAL:
			notify_notification_set_urgency(n, NOTIFY_URGENCY_NORMAL);
			break;

		case URGENCY_CRITICAL:
			notify_notification_set_urgency(n, NOTIFY_URGENCY_CRITICAL);
			break;
	}

	if (!notify_notification_show(n, NULL))
	{
		*_retval = FALSE;
	}

	g_object_unref(G_OBJECT(n));

	*_retval = TRUE;

	return NS_OK;
}


