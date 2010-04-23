#!/bin/sh

BASE_DIR=`dirname $0`
SCRIPTS_DIR=$BASE_DIR

CUR_PWD=`pwd`
UPGRADE_DIR=${1:-"/tmp/notexists"}
TARGET_DIR=/data/databases
SQLBIN=/usr/bin/sqlite3

ORG_VERSION=`${SQLBIN} $1/vivipos.sqlite "PRAGMA user_version;"`
NEW_VERSION=`${SQLBIN} $TARGET_DIR/vivipos.sqlite "PRAGMA user_version;"`

VIVIPOS_EXPORT_SCRIPT=vivipos.exp
VIVIPOS_ACL_EXPORT_SCRIPT=vivipos_acl.exp
VIVIPOS_EXTENSION_EXPORT_SCRIPT=vivipos_extension.exp
VIVIPOS_ORDER_EXPORT_SCRIPT=vivipos_order.exp
VIVIPOS_TABLE_EXPORT_SCRIPT=vivipos_table.exp
VIVIPOS_ORDER_UPGRADE_SCRIPT=vivipos_order.upg
VIVIPOS_INVENTORY_EXPORT_SCRIPT=vivipos_inventory.exp

VIVIPOS_IMPORT_SCRIPT=vivipos.imp
VIVIPOS_ACL_IMPORT_SCRIPT=vivipos_acl.imp
VIVIPOS_EXTENSION_IMPORT_SCRIPT=vivipos_extension.imp
VIVIPOS_ORDER_IMPORT_SCRIPT=vivipos_order.imp
VIVIPOS_TABLE_IMPORT_SCRIPT=vivipos_table.imp
VIVIPOS_INVENTORY_IMPORT_SCRIPT=vivipos_inventory.imp

. /lib/lsb/init-functions

RED=`/usr/bin/tput setaf 1;`
YELLOW=`/usr/bin/tput setaf 2;/usr/bin/tput bold;`
NORMAL=`/usr/bin/tput op`

if [ ! -d $1 ]; then
/bin/echo -e "${RED}!!!!!!!!!! ${YELLOW} $UPGRADE_DIR NOT EXISTS ${RED} !!!!!!!!!!${NORMAL}"
exit 1
fi

/bin/echo -e "${RED}!!!!!!!!!! CONVERT DATABASES to VERSION:${NORMAL} ${YELLOW} ${NEW_VERSION} ${NORMAL}${RED} !!!!!!!!!!${NORMAL}"


# chdir to $UPGRADE_DIR
cd $UPGRADE_DIR

# export / import vivipos.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_EXPORT_SCRIPT} ]; then
	log_daemon_msg "Exporting data from old 'vivipos.sqlite' "
	${SQLBIN} ${UPGRADE_DIR}/vivipos.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_EXPORT_SCRIPT}
	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_IMPORT_SCRIPT}
	log_end_msg $?
fi

# export / import vivipos_acl.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_ACL_EXPORT_SCRIPT} ]; then
	log_daemon_msg "Exporting data from old 'vivipos_acl.sqlite' "
	${SQLBIN} ${UPGRADE_DIR}/vivipos_acl.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_ACL_EXPORT_SCRIPT}
	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_ACL_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos_acl.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos_acl.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_ACL_IMPORT_SCRIPT}
	log_end_msg $?
fi

# export / import vivipos_extension.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_EXTENSION_EXPORT_SCRIPT} ]; then
	log_daemon_msg "Exporting data from old 'vivipos_extension.sqlite' "
	${SQLBIN} ${UPGRADE_DIR}/vivipos_extension.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_EXTENSION_EXPORT_SCRIPT}
	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_EXTENSION_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos_extension.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos_extension.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_EXTENSION_IMPORT_SCRIPT}
	log_end_msg $?
fi

# export / import vivipos_order.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_ORDER_UPGRADE_SCRIPT} ]; then
	${SQLBIN} ${UPGRADE_DIR}/vivipos_order.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_ORDER_UPGRADE_SCRIPT}
fi

if [ -f ${SCRIPTS_DIR}/${VIVIPOS_ORDER_EXPORT_SCRIPT} ]; then
	log_daemon_msg "Exporting data from old 'vivipos_order.sqlite' "
	${SQLBIN} ${UPGRADE_DIR}/vivipos_order.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_ORDER_EXPORT_SCRIPT}
	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_ORDER_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos_order.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos_order.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_ORDER_IMPORT_SCRIPT}
	log_end_msg $?
fi


# export / import vivipos_table.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_TABLE_EXPORT_SCRIPT} ]; then
	log_daemon_msg "Exporting data from old 'vivipos_table.sqlite' "
	${SQLBIN} ${UPGRADE_DIR}/vivipos_table.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_TABLE_EXPORT_SCRIPT}
	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_TABLE_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos_table.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos_table.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_TABLE_IMPORT_SCRIPT}
	log_end_msg $?
fi


# export / import vivipos_inventory.sqlite
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_INVENTORY_EXPORT_SCRIPT} ]; then

        TIMESTAMP=`date +%s`
        COMMIT_ID=`uuidgen`
	log_daemon_msg "Exporting data from old 'vivipos.sqlite' "

        # output "inventory_commitments"
        echo "${COMMIT_ID}|inventory||${TIMESTAMP}|${TIMESTAMP}||superuser" > inventory_commitments.csv

        # export from products
        sed "s/{COMMIT_ID}/${COMMIT_ID}/g" ${SCRIPTS_DIR}/${VIVIPOS_INVENTORY_EXPORT_SCRIPT} | sed "s/{TIMESTAMP}/${TIMESTAMP}/g" | ${SQLBIN} ${UPGRADE_DIR}/vivipos.sqlite

	log_end_msg $?
fi
if [ -f ${SCRIPTS_DIR}/${VIVIPOS_INVENTORY_IMPORT_SCRIPT} ]; then
	log_daemon_msg "Importing data into new 'vivipos_inventory.sqlite' "
	${SQLBIN} ${TARGET_DIR}/vivipos_inventory.sqlite < ${SCRIPTS_DIR}/${VIVIPOS_INVENTORY_IMPORT_SCRIPT}
	log_end_msg $?
fi


log_daemon_msg "Cleaning up export/import temp files "
rm -f *.csv
log_end_msg 0

# return to original dir
cd $CUR_PWD

/bin/echo -e "${RED}!!!!!!!!!! Data Convert Completed !!!!!!!!!!${NORMAL}"

