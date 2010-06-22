#!/bin/sh

EXTENSIONS_DIR=/data/profile/extensions
ROUNDROCK_DIR=roundrock@vivisystems.com.tw/
SCRIPT=${EXTENSIONS_DIR}/${ROUNDROCK_DIR}/chrome/content/scripts/powerbtn.sh

if [ -x "${SCRIPT}" ]; then
    exec ${SCRIPT} $@
elif [ -x "$0.vivipos" ]; then
    exec $0.vivipos $@
else
    /sbin/shutdown -h now "Power button pressed"
    exit 0
fi

