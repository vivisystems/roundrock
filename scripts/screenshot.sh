#!/bin/sh

: ${DIALOG=zenity}

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
MSG_SCREENSHOT_SAVED=${MSG_SCREENSHOT_SAVED:-"Screen shot has been saved to:"}
MSG_SCREENSHOT_CONFIRM_COPY=${MSG_SCREENSHOT_CONFIRM_COPY:-"Do you want to save screen shot and system logs to USB flash drive?"}
MSG_SCREENSHOT_COPIED=${MSG_SCREENSHOT_COPIED:-"Screen shot and system logs have been saved to:"}
MSG_SCREENSHOT_COPIED_INFO=${MSG_SCREENSHOT_COPIED_INFO:-"Please provide this file to local support engineer."}
MSG_SCREENSHOT_NOTFOUND=${MSG_SCREENSHOT_NOTFOUND:-"USB flash drive not found."}



TS=`date "+%Y%m%d%H%M%S"`
FILE=/data/screenshots/${TS}.jpg

import -window root ${FILE}

$DIALOG --info --text="$MSG_SCREENSHOT_SAVED \n ${FILE}"


$DIALOG --question --text="$MSG_SCREENSHOT_CONFIRM_COPY"

RETVAL=$?

if [ "$RETVAL" = "0" ]; then

	DIR=`cat /tmp/last_media`

	if [ -d $DIR ]; then
	
		mkdir /tmp/$TS
		
		cp /data/vivipos_sdk/log/vivipos.log /tmp/$TS		
		cp /data/vivipos_webapp/app/tmp/logs/* /tmp/$TS		
		cp /var/log/syslog /tmp/$TS
		cp /var/log/sync_client.log /tmp/$TS
		cp /var/log/messages /tmp/$TS
		cp /var/log/dmesg /tmp/$TS
		cp /data/vivipos_sdk/application.ini /tmp/$TS
		cp /data/profile/extensions.rdf /tmp/$TS
        cp /data/profile/prefs.js /tmp/$TS
        [ -f /data/profile/user.js ] && cp /data/profile/user.js /tmp/$TS
        [ -f /data/profile/Invalidprefs.js ] && cp /data/profile/Invalidprefs.js /tmp/$TS
        [ -f /data/profile/Invalidprefs.js.bak ] && cp /data/profile/Invalidprefs.js.bak /tmp/$TS

		cp $FILE /tmp/$TS
	
		# include sync_settings.ini
		. /data/profile/sync_settings.ini

		cd /tmp/$TS

		ZIP_FILE="${DIR}/${machine_id}_${TS}.zip"
		
		zip -r "${ZIP_FILE}" *

		rm -fr /tmp/$TS

		sync; sync;
		sync; sync;

		$DIALOG --info --text="$MSG_SCREENSHOT_COPIED \n ${ZIP_FILE} \n\n $MSG_SCREENSHOT_COPIED_INFO"

	else 

		$DIALOG --info --text="$MSG_SCREENSHOT_NOTFOUND"

	fi

fi

exit 0
