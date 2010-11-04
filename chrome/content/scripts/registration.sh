#!/bin/sh
#
# ROUNDROCK registration tool
#
# irving.hsu@vivisystems.com.tw
#
: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages


# support center variables
SUPPORT_FQDN_FILE=/etc/support.site
if [ -r "$SUPPORT_FQDN_FILE" ]; then
    SUPPORT_FQDN=`cat "$SUPPORT_FQDN_FILE"`
fi
SSL_CERTIFICATE=/etc/roundrock.pem
SSL_CA_CERTIFICATE=/etc/ca-certificates/ca-cert.pem


# system serial number
SERIAL=$1


# data for 3.5G modem
MODEM_IMEI=$2
MODEM_MARKER=/tmp/3g-modem.device.gnokii
WVDIAL=wvdial


# other parameters
PARM_NAME=$3
PARM_OWNER=$4
PARM_CONTACT=$5
PARM_PHONE=$6
PARM_ZIP=$7
PARM_CITY=$8
PARM_DISTRICT=$9
PARM_ADDRESS=$10


# output file
OUTPUT_FILE=${11:-/tmp/registration.status}
rm -f "$OUTPUT_FILE"

POST_STATUS=""; export POST_STATUS
POST_RESPONSE=""; export POST_RESPONSE


################################################################################################################


dial_modem() {

    echo "0\n#${MSG_SCRIPT_REGISTRATION_START_MODEM}"
    sleep 1

    sudo killall pppd wvdial >/dev/null 2>&1

    # dialing cht
    sudo ${WVDIAL} cht >/tmp/pppd-session 2>&1 &

    # wait until ppp0 if up and running
    WAITS=5
    PPPD=1
    IP=
    while [ \( $PPPD -eq 1 -o -z "$IP" \) -a $WAITS -ne 0 ]; do
        sleep 5
        IP=`ifconfig ppp0 | egrep -o -e "inet addr:[0-9]+.[0-9]+.[0-9]+.[0-9]+" | awk -F":" '{print $2}'`
        PPPD=$?

        WAITS=$((WAITS - 1))
    done
}

################################################################################################################

send_registration_data() {

    $DIALOG --progress --pulsate \
            --title="${MSG_SCRIPT_REGISTRATION_TITLE}" \
            --text="${MSG_SCRIPT_REGISTRATION_START_POSTING}" \
            --percentage=0 --auto-close --auto-kill --width=480 --height=120 &
    sleep 1

    POST_DATA="func=register&IMEI=$MODEM_IMEI&SERIAL=$SERIAL&NAME=$PARM_NAME&OWNER=$PARM_OWNER&CONTACT=$PARM_CONTACT&PHONE=$PARM_PHONE&ZIP=$PARM_ZIP&CITY=$PARM_CITY&DISTRICT=$PARM_DISTRICT&ADDRESS=$PARM_ADDRESS"
    SUPPORT_URL="https://$SUPPORT_FQDN/cgi-bin/Server/vivipos/service.php"
    #SUPPORT_URL="https://$SUPPORT_FQDN/cgi-bin/echo.php"

    POST_RESPONSE=`wget --waitretry=5 --no-http-keep-alive --no-cache -T 12 -t 3 -O - 2>&1 \
                        --ca-certificate="$SSL_CA_CERTIFICATE" --certificate="$SSL_CERTIFICATE" \
                        --post-data="$POST_DATA" $SUPPORT_URL`
    POST_STATUS=$?

    killall $DIALOG

    return $POST_STATUS
}

################################################################################################################


if [ -z "$SUPPORT_FQDN" -o -z "$SERIAL" -o -z "$MODEM_IMEI" ]; then
    echo 1 > "$OUTPUT_FILE"
    exit
fi

# dial modem
dial_modem | $DIALOG --progress --pulsate \
      --title="${MSG_SCRIPT_REGISTRATION_TITLE}" \
      --percentage=0 --auto-close --auto-kill --width=480 --height=120

if [ -n "$IP" ]; then
    send_registration_data

    if [ $? -ne 0 ]; then
        echo "3\n$?\${POST_RESPONSE}" > "$OUTPUT_FILE"
    else
        echo "0\n${POST_RESPONSE}" > "$OUTPUT_FILE"
    fi
else
    echo 2 > "$OUTPUT_FILE"
fi

sudo killall pppd wvdial >/dev/null 2>&1
