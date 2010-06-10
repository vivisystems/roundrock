#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

APPLICATION=xulrunner-bin

ACTIVE_WINDOW_PREFIX="_NET_ACTIVE_WINDOW(WINDOW): window id # "
ACTIVE_WINDOW=""

WINDOW_STACK=""
WINDOW_STACK_PREFIX="_NET_CLIENT_LIST_STACKING(WINDOW): window id # "

WINDOW_CLASS=""
WINDOW_CLASS_PREFIX="WM_CLASS(STRING) = "

WINDOW_ROLE=""
WINDOW_ROLE_PREFIX="WM_WINDOW_ROLE(STRING) = "

#
# get active window
#
get_active_window() {
    ACTIVE_WINDOW=`xprop -root | grep "${ACTIVE_WINDOW_PREFIX}"`
    ACTIVE_WINDOW=${ACTIVE_WINDOW#"${ACTIVE_WINDOW_PREFIX}"}
}

#
# hide all open windows
#
hide() {
    # kill TKCal if TKCal is running
    pkill TKCal

    # get window stack
    WINDOW_STACK=`xprop -root | grep "${WINDOW_STACK_PREFIX}"`
    WINDOW_STACK=`echo ${WINDOW_STACK#"${WINDOW_STACK_PREFIX}"} | sed "s/,//g"`

    for wid in ${WINDOW_STACK}; do
	if [ -n "${wid}" ]; then
	    xwit -unmap -id ${wid}
	fi
    done
}

#
# restore all open windows that were unmapped
#
show() {
    # show window in stacking order
    if [ -n "${WINDOW_STACK}" ]; then
	for wid in ${WINDOW_STACK}; do
	    if [ -n "${wid}" ]; then
		xwit -pop -id ${wid}
	    fi
	done
    fi

    if [ -n "${ACTIVE_WINDOW}" -a "${ACTIVE_WINDOW}" != "0x0" ]; then
	xwit -focus -id ${ACTIVE_WINDOW}
    fi
}

#
# restore all open windows that were unmapped and then terminate script
#
show_and_exit() {
    show
    exit 0
}

#
# determine if we are on main screen
#
on_mainscreen() {
    if [ -n "${ACTIVE_WINDOW}" -a "${ACTIVE_WINDOW}" != "0x0" ]; then
        CLASS=`xprop -id "${ACTIVE_WINDOW}" | grep "${WINDOW_CLASS_PREFIX}"`
        CLASS=${CLASS#"${WINDOW_CLASS_PREFIX}"}

        ROLE=`xprop -id "${ACTIVE_WINDOW}" | grep "${WINDOW_ROLE_PREFIX}"`
        ROLE=${ROLE#"${WINDOW_ROLE_PREFIX}"}

        if [ "${CLASS}" = '"Vivipos", "VIVIPOS"' -a "${ROLE}" = '"Main"' ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

#
# warn user that we are not on main screen and exit
#
warn_not_on_mainscreen() {
    ${DIALOG} --warning \
              --text="${MSC_SCRIPT_POWERBTN_WARNING}"
    return 1
}

# put up confirmation dialog
confirm_shutdown() {
    ${DIALOG} --question --text="${MSG_SCRIPT_POWERBTN_CONFIRM}" \
                         --ok-label="${MSG_SCRIPT_POWERBTN_CONFIRM_OK}" \
                         --cancel-label="${MSG_SCRIPT_POWERBTN_CONFIRM_CANCEL}" \
              || show_and_exit
}

# restore windows so that they can accept keyboard input
do_shutdown() {
    echo "`date +"%Y-%m-%d %H:%M:%S"` :   Power button pressed " >> /data/vivipos_sdk/log/vivipos.log

    ## invoke shutdown from main_controller
    curl -m 5 -s -G "http://localhost:8888/dispatch?command=shutdownMachine&controller=Main&data=PowerButtonPressed" -o /dev/null

    ## 5-10 seconds not shutdown , use plain shutdown
    /sbin/shutdown -h now "Power button pressed"

    exit 0
}

# is X running
if [ -z "$(pgrep ${APPLICATION})" ]; then
    /sbin/shutdown -h now "Power button pressed"
else
    #
    get_active_window

    hide

    # make sure we are on mainscreen
    on_mainscreen || warn_not_on_mainscreen || show_and_exit

    confirm_shutdown || show_and_exit

    # power off confirmed, invoke shutdown on main controller
    do_shutdown || $DIALOG --progress \
                           --title="${MSG_SCRIPT_POWERBTN_POWERDOWN}" \
                           --text="${MSG_SCRIPT_POWERBTN_POWERING_DOWN}" \
                           --percentage=0 --auto-close --width=480 --height=240
fi

