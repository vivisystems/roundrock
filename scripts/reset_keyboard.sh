#!/bin/sh

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

. /etc/environment

#
# include l10n messages
#
if [ -x /data/scripts/l10n_messages ]; then
    . /data/scripts/l10n_messages
fi
MSG_RESET_KEYBOARD_RESTARTING=${MSG_RESET_KEYBOARD_RESTARTING:-"Restarting Virtual Keyboard ..."}


if [ -f /etc/kbmap ] && [ -x /etc/X11/Xsession.d/90matchbox_keyboard ]; then
    killall aosd_cat
    echo "$MSG_RESET_KEYBOARD_RESTARTING" | \
    /usr/bin/aosd_cat -n "Droid Serif 24" -x 100 -u 6000 &
#    /etc/X11/Xsession.d/90matchbox_keyboard 
    restart matchbox-keyboard
    killall aosd_cat
fi

