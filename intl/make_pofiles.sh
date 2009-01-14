#!/bin/sh

BASEDIR=`dirname $0`

BASE_LOCALEDIR=../locale
TEMPLATE=en-US

LOCALES_DIR=$BASEDIR/locale
POFILES_DIR=$BASEDIR/pofile
XPIS_DIR=$BASEDIR/xpi

SUPPORTS=`cat $BASEDIR/SUPPORTS`

echo "process $TEMPLATE pofiles as template"
moz2po $BASE_LOCALEDIR/$TEMPLATE $POFILES_DIR/$TEMPLATE
echo ""
echo ""


for LOCALE  in $SUPPORTS ; do
  echo "process $LOCALE with template ($TEMPLATE)"
  moz2po -t $BASE_LOCALEDIR/$TEMPLATE $LOCALES_DIR/$LOCALE $POFILES_DIR/$LOCALE
  echo ""
done

