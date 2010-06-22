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


killall aosd_cat
echo "$MSG_LOCALE_GEN_CHANGING" | /usr/bin/aosd_cat -n "Droid Serif 24" -x 100 -u 100000 "$MSG_LOCALE_GEN_CHANGING" &
start locale-gen
killall aosd_cat
