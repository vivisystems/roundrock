#!/bin/sh

export DISPLAY=:0

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
    /usr/bin/aosd_cat -d 6000 "$MSG_RESET_KEYBOARD_RESTARTING" &
    /etc/X11/Xsession.d/90matchbox_keyboard 
    killall aosd_cat
fi
