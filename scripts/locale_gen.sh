#!/bin/sh

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

. /etc/environment

if [ -f /tmp/scripts.properties ]; then
	# delete it.
	rm -f /tmp/scripts.properties
fi

#
# include l10n messages
#
if [ -x /data/scripts/l10n_messages ]; then
    . /data/scripts/l10n_messages
fi
MSG_LOCALE_GEN_CHANGING=${MSG_LOCALE_GEN_CHANGING:-"Changing OS Locale ..."}


if [ -x /etc/X11/Xsession.d/60locale-gen ]; then
  killall aosd_cat
  /usr/bin/aosd_cat -x 100 -d 6000 "$MSG_LOCALE_GEN_CHANGING" &
  /etc/X11/Xsession.d/60locale-gen 
  killall aosd_cat
fi