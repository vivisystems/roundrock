#!/bin/sh

#
# VIVIPOS DISK USAGE STATUS
#
# author: racklin@gmail.com
#

DU_FILE=/var/lib/vivipos/diskspace_usage.csv
CHECK_PARTITION=/data

# check /var/lib/vivipos directory exists
if [ ! -d /var/lib/vivipos ];then
	mkdir /var/lib/vivipos;
fi

TODAY=`date '+%Y%m%d'`

DU_USED=`LC_ALL=c df -P ${CHECK_PARTITION} | grep -v "Filesystem" | awk -F " " '{ print $3}'`

DU_AVAILABLE=`LC_ALL=c df -P ${CHECK_PARTITION} | grep -v "Filesystem" | awk -F " " '{ print $4}'`


# check status file exists ?
if [ ! -f "$DU_FILE" ]; then

	# created one
	echo "DATE,USED,AVAILABLE" > $DU_FILE

fi


# check insert or update
grep "$TODAY" $DU_FILE > /dev/null

if [ "$?" -eq "0" ]; then 
	# update
	sed "s/$TODAY,.*/$TODAY,$DU_USED,$DU_AVAILABLE/g" $DU_FILE > /tmp/diskspace_usage.tmp
	cp /tmp/diskspace_usage.tmp $DU_FILE
	rm -f /tmp/diskspace_usage.tmp
else 
	# insert
	echo "$TODAY,$DU_USED,$DU_AVAILABLE" >> $DU_FILE
fi


