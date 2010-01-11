#!/bin/sh

# rebuild database

DB_DIR=/data/databases

export DISPLAY=:0

. /etc/environment

#
# include l10n messages
#
if [ -x /data/scripts/l10n_messages ]; then
    . /data/scripts/l10n_messages
fi
MSG_REBUILD_DATABASES_REBUILDING=${MSG_REBUILD_DATABASES_REBUILDING:-"Rebuilding:"}


#
# STARTING
#
chdir $DB_DIR;
for db in *.sqlite ; do

    /usr/bin/aosd_cat "$MSG_REBUILD_DATABASES_REBUILDING $db" 

    /usr/bin/sqlite3 $DB_DIR/$db ".dump" | /usr/bin/sqlite3 ${DB_DIR}/${db}_new

   if [ -f ${DB_DIR}/${db}_new ]; then
	cp ${DB_DIR}/${db}_new ${DB_DIR}/${db}
	rm -f ${DB_DIR}/${db}_new
   fi

done


sync;