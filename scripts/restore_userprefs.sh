#!/bin/sh

MODE=$1
SOURCE=$2
DEST=$3

if [ "$MODE" = "prefs" ]; then
    if [ -f $SOURCE ]; then
        /bin/cp $SOURCE $DEST
        /bin/chmod 0600 $DEST/prefs.js
    fi
elif [ "$MODE" = "profile" ]; then
    if [ -f $SOURCE ]; then
	/bin/tar xf $SOURCE -C $DEST ./prefs
    fi
fi

