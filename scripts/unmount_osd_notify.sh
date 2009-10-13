#!/bin/sh

export DISPLAY=:0

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
  /usr/bin/aosd_cat -d 1000 "$MSG_UNMOUNT_OSD_NOTIFY_MOUNTED /media/${media_basename}" &
  rm -f /tmp/last_media
else
  /usr/bin/aosd-cat -d 1000 "$MSG_UNMOUNT_OSD_NOTIFY_UNSUPPORT $1" &
fi

