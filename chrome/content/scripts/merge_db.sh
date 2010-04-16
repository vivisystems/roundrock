#!/bin/sh

source_path=$1
target_path=${2:-/data}
tmp_path=${target_path}/`uuid`

echo "** BEGIN ** importing data archive at [${source_path}] into [${target_path}]" > /tmp/merge_db.log

cleanup() {
    if [ -r "${tmp_path}" ]
    then
        rm -rf "${tmp_path}"
    fi
    exit
}

#
# 0. extract from archive
#
if [ -r "${source}/databases.tbz" ]
then
    mkdir -p "${tmp_path}"
    if [ -d "${tmp_path}" ]
    then
        tar xjpf "${source}/databases.tbz" -C "${tmp_path}"
        if [ $? -ne 0 ] then
            cleanup
        fi
    else
        cleanup
    fi
else
    cleanup
fi

#
# 1. vivipos.sqlite - skipped
#
echo "10\n# 'vivipos.sqlite' - ** skipped **" >> /tmp/merge_db.log

#
# 2. vivipos_acl.sqlite - skipped
#
echo "20\n# 'vivipos_acl.sqlite' - ** skipped **" >> /tmp/merge_db.log

#
# 3. vivipos_extension.sqlite - skipped, to be imported by add-on's on dispatched event 'importHistoricalData'
#
echo "30\n# 'vivipos_extension.sqlite' - ** skipped **" >> /tmp/merge_db.log

#
# 4. vivipos_inventory.sqlite - need to be imported
#
# - inventory_commitments
# - inventory_records
#
# rule: current db has precedence over backup db
#
/usr/bin/sqlite3 "${tmp_path}/vivipos_inventory.sqlite" <<EOF
ATTACH DATABASE "${target_path}/databases/vivipos_inventory.sqlite" AS CURRENT
BEGIN;
INSERT OR REPLACE INTO inventory_commitments (SELECT * from CURRENT.inventory_commitments);
INSERT OR REPLACE INTO inventory_records (SELECT * from CURRENT.inventory_records);
DELETE FROM syncs;
DELETE FROM sync_remote_machines;
INSERT INTO syncs (SELECT * FROM CURRENT.syncs);
INSERT INTO sync_remote_machines (SELECT * FROM CURRENT.sync_remote_machines);
COMMIT;
DETACH DATABASE SOURCE
EOF

echo "40\n# 'vivipos_inventory.sqlite' - ** imported **" >> /tmp/merge_db.log

#
# 5. vivipos_journal.sqlite - need to be imported
#
# - journal
#   voiding a completed order updates the status of the journal db entry
#
# rule: current db has precedence over backup db
#
/usr/bin/sqlite3 "${tmp_path}/vivipos_journal.sqlite" <<EOF
ATTACH DATABASE "${target_path}/databases/vivipos_journal.sqlite" AS CURRENT
BEGIN;
INSERT OR REPLACE INTO journal (SELECT * from CURRENT.journal);
COMMIT;
DETACH DATABASE SOURCE
EOF

echo "50\n# 'vivipos_journal.sqlite' - ** imported **" >> /tmp/merge_db.log

#
# 6. vivipos_order.sqlite - need to be imported
#
# - import all tables except syncs & sync_remote_machines
#
# rule: target has precedence over source
#
# algorithm:
#
# for each table:
# - delete all data from source for orders that are present in target db
# - insert all records from
echo "60\n# 'vivipos_order.sqlite' - ** imported **" >> /tmp/merge_db.log

#
# 7. vivipos_table.sqlite - skipped
#
echo "70\n# 'vivipos_table.sqlite' - ** skipped **" >> /tmp/merge_db.log

#
# 8. journal directory - need to be imported
#
# rule: target has precedence over source
#
tar xjpkf "${source}/journal.tbz" -C "${target_path}/journal"
echo "80\n# 'journal files' - ** imported **" >> /tmp/merge_db.log

echo "** END ** - imported data archive at [${source_path}] into [${target_path}]" >> /tmp/merge_db.log
