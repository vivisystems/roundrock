#!/bin/sh

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

media_basename=`basename ${1}`


. /etc/environment

#
# include l10n messages
#
if [ -x /data/scripts/l10n_messages ]; then
    . /data/scripts/l10n_messages
fi
MSG_UNMOUNT_OSD_NOTIFY_MOUNTED=${MSG_UNMOUNT_OSD_NOTIFY_MOUNTED:-"Media Removed:"}
MSG_UNMOUNT_OSD_NOTIFY_UNSUPPORT=${MSG_UNMOUNT_OSD_NOTIFY_UNSUPPORT:-"Device Removed:"}


if [ -d /media/${media_basename} ]; then
  echo "$MSG_UNMOUNT_OSD_NOTIFY_MOUNTED /media/${media_basename}" | \
  /usr/bin/aosd_cat -x 100 -u 1000 &
  rm -f /tmp/last_media
else
  echo "$MSG_UNMOUNT_OSD_NOTIFY_UNSUPPORT $1" | \
  /usr/bin/aosd-cat -x 100 -u 1000 &
fi

