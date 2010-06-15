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
    # get new window stack
    NEW_WINDOW_STACK=`xprop -root | grep "${WINDOW_STACK_PREFIX}"`
    NEW_WINDOW_STACK=`echo ${NEW_WINDOW_STACK#"${WINDOW_STACK_PREFIX}"} | sed "s/,//g"`
    echo "NEW WINDOW [${NEW_WINDOW_STACK}] ACTIVE WINDOW [${ACTIVE_WINDOW}]" > /tmp/stack.log

    # restore original window stack
    if [ -n "${WINDOW_STACK}" ]; then
	for wid in ${WINDOW_STACK}; do
	    if [ -n "${wid}" ]; then
		xwit -pop -id ${wid}
	    fi
	done
    fi

    # place new windows on top
    if [ -n "${NEW_WINDOW_STACK}" ]; then
	for wid in ${NEW_WINDOW_STACK}; do
	    if [ -n "${wid}" ]; then
		xwit -pop -focus -id ${wid}
	    fi
	done
    elif [ -n "${ACTIVE_WINDOW}" -a "${ACTIVE_WINDOW}" != "0x0" ]; then
	xwit -focus -id ${ACTIVE_WINDOW}
    fi
}

#
# determine if we are on main screen
#
on_mainscreen() {
echo "`date` checking if on mainscreen" > /tmp/powerbtn.log
    if [ -n "${ACTIVE_WINDOW}" -a "${ACTIVE_WINDOW}" != "0x0" ]; then
        CLASS=`xprop -id "${ACTIVE_WINDOW}" | grep "${WINDOW_CLASS_PREFIX}"`
        CLASS=${CLASS#"${WINDOW_CLASS_PREFIX}"}

        ROLE=`xprop -id "${ACTIVE_WINDOW}" | grep "${WINDOW_ROLE_PREFIX}"`
        ROLE=${ROLE#"${WINDOW_ROLE_PREFIX}"}

echo "`date` [${CLASS}] [${ROLE}]" >> /tmp/powerbtn.log
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

    hide

    ${DIALOG} --warning \
              --text="${MSC_SCRIPT_POWERBTN_WARNING}"

    show

    exit
}

do_shutdown() {
    echo "`date +"%Y-%m-%d %H:%M:%S"` :   Power button pressed " >> /data/vivipos_sdk/log/vivipos.log

    ## invoke shutdown from main_controller
    curl -m 5 -s -G "http://localhost:8888/dispatch?command=shutdown&controller=Main&data=PowerButtonPressed" -o /dev/null

}

# is X running
if [ -z "$(pgrep ${APPLICATION})" ]; then
    /sbin/shutdown -h now "Power button pressed"
else

    get_active_window

    # make sure we are on mainscreen
    on_mainscreen || warn_not_on_mainscreen

    # invoke Main.shutdown() method
    do_shutdown 
fi

