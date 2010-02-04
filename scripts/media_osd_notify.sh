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
MSG_MEDIA_OSD_NOTIFY_MOUNTED=${MSG_MEDIA_OSD_NOTIFY_MOUNTED:-"Media Mounted:"}
MSG_MEDIA_OSD_NOTIFY_UNSUPPORT=${MSG_MEDIA_OSD_NOTIFY_UNSUPPORT:-"Unsupport Device:"}


if [ -d /media/${media_basename} ]; then
  /usr/bin/aosd_cat -x 100 -d 3000 "$MSG_MEDIA_OSD_NOTIFY_MOUNTED /media/${media_basename}" &
  echo "/media/${media_basename}" > /tmp/last_media
else
  /usr/bin/aosd-cat -x 100 -d 3000 "$MSG_MEDIA_OSD_NOTIFY_UNSUPPORT $1" &
fi
