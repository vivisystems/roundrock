#!/bin/sh

UPGRADE_DIR=/data/databases/upgrade/1.0.2
#TARGET_DIR="/home/user/Desktop/db 1.0.2"
TARGET_DIR=/data/databases
SQLBIN=/usr/bin/sqlite3

VIVIPOS_ORDER_EXPORT_SCRIPT=vivipos_order.exp
VIVIPOS_EXPORT_SCRIPT=vivipos.exp
VIVIPOS_EXTENSION_UPGRADE_SCRIPT=vivipos_extension.upg

echo "This script will export existing data into a form compatible for import into VIVIPOS version 1.1.0"

# copy database files to upgrade directory
mkdir -p ${UPGRADE_DIR}
cp -p "${TARGET_DIR}"/*.sqlite ${UPGRADE_DIR}

# copy export/upgrade scripts to upgrade directory
cp ./${VIVIPOS_ORDER_EXPORT_SCRIPT} ${UPGRADE_DIR}
cp ./${VIVIPOS_EXPORT_SCRIPT} ${UPGRADE_DIR}
cp ./${VIVIPOS_EXTENSION_UPGRADE_SCRIPT} ${UPGRADE_DIR}

cd ${UPGRADE_DIR}

# vivipos_acl requires no further processing

# create new tables in vivipos_extension
echo
echo 'creating new tables in vivipos_extension...'
${SQLBIN} ${UPGRADE_DIR}/vivipos_extension.sqlite < ${UPGRADE_DIR}/${VIVIPOS_EXTENSION_UPGRADE_SCRIPT}

# export data from vivipos_order
echo
echo 'exporting data from vivipos_order.sqlite...'
${SQLBIN} ${UPGRADE_DIR}/vivipos_order.sqlite < ${UPGRADE_DIR}/${VIVIPOS_ORDER_EXPORT_SCRIPT}
echo 'done'

# export data from vivipos
echo
echo 'exporting data from vivipos.sqlite...'
${SQLBIN} ${UPGRADE_DIR}/vivipos.sqlite < ${UPGRADE_DIR}/${VIVIPOS_EXPORT_SCRIPT}
echo
echo 'cleaning up...'
rm ${UPGRADE_DIR}/${VIVIPOS_ORDER_EXPORT_SCRIPT}
rm ${UPGRADE_DIR}/${VIVIPOS_EXPORT_SCRIPT}
rm ${UPGRADE_DIR}/${VIVIPOS_EXTENSION_UPGRADE_SCRIPT}
echo 'done'

echo
echo 'Data Export completed'

