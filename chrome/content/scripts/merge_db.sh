#!/bin/sh

source_path=$1
target_path=${2:-/data}
tmp_path="${target_path}/backups/`uuid`"

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
if [ -r "${source_path}/databases.tbz" ]
then
    mkdir -p "${tmp_path}"
    if [ -d "${tmp_path}" ]
    then
        tar xjpf "${source_path}/databases.tbz" -C "${tmp_path}"
        if [ $? -ne 0 ]; then
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
# rule: current db has precedence over historical db
#
if [ -r "${tmp_path}/vivipos_inventory.sqlite" -a -r "${target_path}/databases/vivipos_inventory.sqlite" ]; then

/usr/bin/sqlite3 "${target_path}/databases/vivipos_inventory.sqlite" <<EOF
ATTACH DATABASE "${tmp_path}/vivipos_inventory.sqlite" AS HISTORICAL;
BEGIN;
INSERT OR IGNORE INTO inventory_commitments SELECT * from HISTORICAL.inventory_commitments;
INSERT OR IGNORE INTO inventory_records SELECT * from HISTORICAL.inventory_records;
COMMIT;
DETACH DATABASE HISTORICAL;
EOF

fi
echo "40\n# 'vivipos_inventory.sqlite' - ** imported **" >> /tmp/merge_db.log

#
# 5. vivipos_journal.sqlite - need to be imported
#
# - journal
#   voiding a completed order updates the status of the journal db entry
#
# rule: current db has precedence over backup db
#
if [ -r "${tmp_path}/vivipos_journal.sqlite" -a -r "${target_path}/databases/vivipos_journal.sqlite" ]; then

/usr/bin/sqlite3 "${target_path}/databases/vivipos_journal.sqlite" <<EOF
ATTACH DATABASE "${tmp_path}/vivipos_journal.sqlite" AS HISTORICAL;
BEGIN;
INSERT OR IGNORE INTO journal SELECT * from HISTORICAL.journal;
COMMIT;
DETACH DATABASE HISTORICAL;
EOF

fi
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
if [ -r "${tmp_path}/vivipos_order.sqlite" -a -r "${target_path}/databases/vivipos_order.sqlite" ]; then

/usr/bin/sqlite3 "${target_path}/databases/vivipos_order.sqlite" << EOF
ATTACH DATABASE "${tmp_path}/vivipos_order.sqlite" AS HISTORICAL;
ATTACH DATABASE :memory AS CACHE;
CREATE TABLE CACHE.cached_orders AS SELECT id from orders;
BEGIN;
INSERT OR IGNORE INTO cashdrawer_records SELECT * from HISTORICAL.cashdrawer_records;
INSERT OR IGNORE INTO clock_stamps SELECT * from HISTORICAL.clock_stamps;
INSERT OR IGNORE INTO ledger_receipts SELECT * from HISTORICAL.ledger_receipts;
INSERT OR IGNORE INTO ledger_records SELECT * from HISTORICAL.ledger_records;
INSERT OR IGNORE INTO shift_change_details SELECT * from HISTORICAL.shift_change_details;
INSERT OR IGNORE INTO shift_changes SELECT * from HISTORICAL.shift_changes;
INSERT OR IGNORE INTO uniform_invoices SELECT * from HISTORICAL.uniform_invoices;
INSERT OR IGNORE INTO orders SELECT * from HISTORICAL.orders;
INSERT OR IGNORE INTO order_additions SELECT * from HISTORICAL.order_additions where HISTORICAL.order_additions.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_annotations SELECT * from HISTORICAL.order_annotations where HISTORICAL.order_annotations.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_item_condiments SELECT * from HISTORICAL.order_item_condiments where HISTORICAL.order_item_condiments.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_item_taxes SELECT * from HISTORICAL.order_item_taxes where HISTORICAL.order_item_taxes.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_items SELECT * from HISTORICAL.order_items where HISTORICAL.order_items.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_objects SELECT * from HISTORICAL.order_objects where HISTORICAL.order_objects.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_payments SELECT * from HISTORICAL.order_payments where HISTORICAL.order_payments.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_promotions SELECT * from HISTORICAL.order_promotions where HISTORICAL.order_promotions.order_id NOT IN (SELECT id from CACHE.cached_orders);
INSERT OR IGNORE INTO order_receipts SELECT * from HISTORICAL.order_receipts where HISTORICAL.order_receipts.order_id NOT IN (SELECT id from CACHE.cached_orders);
COMMIT;
DETACH DATABASE HISTORICAL;
DETACH DATABASE CACHE;
EOF

fi
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
if [ -r "${source_path}/journal.tbz" ]; then
    tar xjpkf "${source_path}/journal.tbz" -C "${target_path}/journal" >> /tmp/merge_db 2>/dev/null
fi
echo "80\n# 'journal files' - ** imported **" >> /tmp/merge_db.log

#
# 9. images directory - need to be imported
#
# rule: target has precedence over source
#
if [ -r "${source_path}/images.tbz" ]; then
    tar xjpkf "${source_path}/images.tbz" -C "${target_path}/images" >> /tmp/merge_db 2>/dev/null
fi
echo "90\n# 'image files' - ** imported **" >> /tmp/merge_db.log

#cleanup

echo "** END ** - imported data archive at [${source_path}] into [${target_path}]" >> /tmp/merge_db.log
