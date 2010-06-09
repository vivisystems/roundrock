#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

# put up confirmation dialog
xwit -iconify -names "VIVIPOS"
zenity --question --text="${MSG_SCRIPT_POWERBTN_CONFIRM}" \
                  --ok-label="${MSG_SCRIPT_POWERBTN_CONFIRM_OK}" \
                  --cancel-label="${MSG_SCRIPT_POWERBTN_CONFIRM_CANCEL}" \
       || xwit -pop -focus -names "VIVIPOS"

do_shutdown() {

    # finally do shutdown
    /sbin/shutdown -h now "Power button pressed"

}

# power off confirmed, first gracefully shutdown our application
do_shutdown | zenity --progress --percentage=0 --pulsate --text "${MSG_SCRIPT_POWERBTN_SHUTDOWN}"

