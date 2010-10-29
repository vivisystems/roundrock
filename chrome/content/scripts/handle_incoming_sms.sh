#!/bin/bash

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

VNC_PASSFILE=/data/profile/x11vnc_passwd
VNC_PROG=/usr/bin/x11vnc
VNC_CONTROL=x11vnc

SUPPORT_FQDN=`cat /etc/support.site`
SUPPORT_FQDN=${SUPPORT_FDQN:-support.vivisystems.com.tw}

STATUS_URL=https://$SUPPORT_FQDN/cgi-bin/Server/vivipos/service.php

MSG=`cat`
echo `date` [$#] $@ : $MSG >> /tmp/sms.log

MSG_ACTION=
MSG_IMEI=
MSG_SERIAL=

parse_message() {

    MSG_ACTION=`echo $1 | tr [:lower:] [:upper:] 2>/dev/null`
    MSG_IMEI=$2
    MSG_SERIAL=$3

}

validate_msg() {

    [ "$MSG_IMEI" = "$IMEI" -a "$MSG_SERIAL" = "$SERIAL" \
	 -a \( "$MSG_ACTION" = "VNC-UP" -o "$MSG_ACTION" = "VNC-DOWN" \
	 -o "$MSG_ACTION" = "UP" -o "$MSG_ACTION" = "DOWN" \) ]

}

#
# information used to manipulate various windows
#
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

    echo "NEW WINDOW [${NEW_WINDOW_STACK}] ACTIVE WINDOW [${ACTIVE_WINDOW}]" > /tmp/vnc.log

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

allow_vnc() {

    local RC

    # allow VNC only if application is running
    [ -z "$(pgrep ${APPLICATION})" ] && return 1

    # record the top most active window
    get_active_window

    # hide all windows
    hide

    zenity --width=600 --height=100 --question \
           --text="$MSG_SCRIPT_VNC_ACCESS" \
           --ok-label="$MSG_SCRIPT_VNC_ACCESS_OK" \
           --cancel-label="$MSG_SCRIPT_VNC_ACCESS_CANCEL" \

    RC=$?

    show

    return $RC
}

parse_message $MSG

validate_msg || exit

case "$MSG_ACTION" in

    UP|VNC-UP)

	# stop existing pppd & wvdial
	killall wvdial pppd
	sleep 2

        # allow VNC?
        if [ "$MSG_ACTION" = "VNC-UP" ]; then
            allow_vnc || exit
        fi

        # bring up PPP
	wvdial cht >/dev/null 2>&1 &
	
	WAITS=5
	PPPD=1
	while [ $PPPD -eq 1 -a $WAITS -ne 0 ]; do
	    sleep 5
	    ifconfig ppp0
	    PPPD=$?

	    WAITS=$((WAITS - 1))
	done

	# are we up?
	if [ $PPPD -eq 0 ]; then

	    # inform support center that network is up
	    POST_DATA=func=network-status&SERIAL=$SERIAL&STATUS=1
	    wget --waitretry=5 --no-check-certificate --certificate=/etc/roundrock.pem --no-cache \
	    	 -T 120 -t 3 -O /dev/null --post-data="$POST_DATA" $STATUS_URL

	    # are we able to connect to support center?
	    if [ $? -ne 0 ]; then

		# failed to connect to support center; terminate PPP

		killall wvdial pppd

	    else

		# bring up VNC?

		if [ "$MSG_ACTION" = "VNC-UP" ]; then

		    # generate new VNC passcode and bring up VNC
		    VNC_PASSCODE=`expr $RANDOM + $RANDOM`
		    $VNC_PROG -storepasswd $VNC_PASSCODE $VNC_PASSFILE

		    stop $VNC_CONTROL
		    start $VNC_CONTROL

		    # inform support center that VNC is up
		    POST_DATA=func=vnc-status&SERIAL=$SERIAL&STATUS=$VNC_PASSCODE
		    wget --waitretry=5 --no-check-certificate --certificate=/etc/roundrock.pem \
			 --no-cache -T 120 -t 3 -O /dev/null --post-data="$POST_DATA" $STATUS_URL

		    if [ $? -ne 0 ]; then
			killall wvdial pppd
		    fi
		fi
	    fi

	else
	    killall wvdial pppd
	fi
	;;

    DOWN|VNC-DOWN)

	# bring down VNC
	stop $VNC_CONTROL

	# inform support center that VNC is down
	POST_DATA=func=vnc-status&SERIAL=$SERIAL&STATUS=0
	wget --waitretry=5 --no-check-certificate --certificate=/etc/roundrock.pem \
	     --no-cache -T 120 -t 3 -O /dev/null --post-data="$POST_DATA" $STATUS_URL


	# bring down ppp?

	if [ "$MSG_ACTION" = "DOWN" ]; then

	    # inform support center that network is down
	    POST_DATA=func=network-status&SERIAL=$SERIAL&STATUS=0
	    wget --waitretry=5 --no-check-certificate --certificate=/etc/roundrock.pem \
		 --no-cache -T 120 -t 3 -O /dev/null --post-data="$POST_DATA" $STATUS_URL

	    killall wvdial pppd
	fi
	;;

esac

