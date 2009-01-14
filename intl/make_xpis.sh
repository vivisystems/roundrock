#!/bin/sh

BASEDIR=`dirname $0`

BASE_LOCALEDIR=../locale
TEMPLATE=en-US

LOCALES_DIR=$BASEDIR/locale
POFILES_DIR=$BASEDIR/pofile
XPIS_DIR=$BASEDIR/xpi

SUPPORTS=`cat $BASEDIR/SUPPORTS`

for LOCALE  in $SUPPORTS ; do
  echo "process $LOCALE XPI with template ($TEMPLATE)"

  rm -f $XPIS_DIR/$LOCALE/chrome/$LOCALE.jar
  zip -r $XPIS_DIR/$LOCALE/chrome/$LOCALE.jar $LOCALES_DIR/$LOCALE

  rm -f $XPIS_DIR/langpack-$LOCALE.xpi
  
  # pushd
  CUR_DIR=`pwd`
  cd $XPIS_DIR/$LOCALE

  zip -r ../langpack-$LOCALE.xpi *
  
  #popd
  cd $CUR_DIR


  echo ""
done

