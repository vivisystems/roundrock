#!/bin/sh

all_tables="cashdrawer_records \
            clock_stamps \
            ledger_receipts \
            ledger_records \
            order_additions \
            order_annotations \
            order_item_condiments \
            order_item_taxes \
            order_items \
            order_objects \
            order_payments \
            order_promotions \
            order_queues \
            order_receipts \
            orders \
            shift_changes \
            shift_change_details \
            shift_markers \
            sync_remote_machines \
            syncs \
            uniform_invoice_markers \
            uniform_invoices"

pid=$$
target=${1:-/data/databases/vivipos_order.sqlite}
marker=${2:-/tmp/.roundrock.truncate}
sqlite3=/usr/bin/sqlite3

start_clients() {
    sudo /etc/init.d/lighttpd start >/dev/null 2>&1
    sudo /data/vivipos_webapp/sync_client start >/dev/null 2>&1
    sudo /data/vivipos_webapp/irc_client start >/dev/null 2>&1
}

stop_clients() {
    sudo /etc/init.d/lighttpd stop
    sudo /data/vivipos_webapp/sync_client stop
    sudo /data/vivipos_webapp/irc_client stop
}

if [ -w ${target} ]; then

    # stop clients
    stop_clients

    for table in ${all_tables}; do
        echo "Truncating table ${table}..."
        time -p $sqlite3 "${target}" >/tmp/truncate_${pid}_${table}.drop 2>&1 <<EOF
.output /tmp/truncate_${pid}_${table}.schema
.schema ${table}
.output stdout
drop table ${table};
.read /tmp/truncate_${pid}_${table}.schema
EOF
        time -p sync >/tmp/truncate_${pid}_${table}.sync 2>&1
    done

    # restart clients
    start_clients
fi

rm "${marker}"