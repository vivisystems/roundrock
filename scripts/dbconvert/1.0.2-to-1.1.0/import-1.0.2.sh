#!/bin/sh

UPGRADE_DIR=/data/databases/upgrade/1.0.2
TARGET_DIR=/data/databases/
SQLBIN=/usr/bin/sqlite3

VIVIPOS_ORDER_IMPORT_SCRIPT=vivipos_order.imp
VIVIPOS_IMPORT_SCRIPT=vivipos.imp

echo
echo "This script will import existing data into VIVIPOS version 1.1.0"

# copy import scripts to upgrade directory
cp ./${VIVIPOS_ORDER_IMPORT_SCRIPT} ${UPGRADE_DIR}
cp ./${VIVIPOS_IMPORT_SCRIPT} ${UPGRADE_DIR}

cd ${UPGRADE_DIR}

# vivipos_acl, vivipos_extension require no further processing
cp ${UPGRADE_DIR}/vivipos_acl.sqlite ${TARGET_DIR}
cp ${UPGRADE_DIR}/vivipos_extension.sqlite ${TARGET_DIR}

# import data into vivipos_order
echo
echo 'importing data into vivipos_order.sqlite...'
${SQLBIN} ${TARGET_DIR}/vivipos_order.sqlite < ${UPGRADE_DIR}/${VIVIPOS_ORDER_IMPORT_SCRIPT}
echo 'done'

# import data into vivipos
echo
echo 'importing data into vivipos.sqlite...'
${SQLBIN} ${TARGET_DIR}/vivipos.sqlite < ${UPGRADE_DIR}/${VIVIPOS_IMPORT_SCRIPT}
echo 'done'
echo

# cleanup
echo 
echo 'cleaning up...'
rm -f ${UPGRADE_DIR}/*.sql
rm -f ${UPGRADE_DIR}/*.imp
echo 'done'

echo
echo 'Data Import completed'

