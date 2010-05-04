#!/bin/sh -x

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

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
sqlite3=/usr/bin/sqlite3
db_recover=/usr/local/BerkeleyDB.5.0/bin/db_recover

start_services() {
    sudo /etc/init.d/lighttpd start >/dev/null 2>&1
    sudo /data/vivipos_webapp/sync_client start >/dev/null 2>&1
    sudo /data/vivipos_webapp/irc_client start >/dev/null 2>&1
}

stop_services() {
    sudo /data/vivipos_webapp/sync_client stop >/dev/null 2>&1
    sudo /data/vivipos_webapp/irc_client stop >/dev/null 2>&1
    sudo /etc/init.d/lighttpd stop >/dev/null 2>&1
}

do_truncate() {
    # stop services
    echo "0\n# ${MSG_SCRIPT_TRUNCATE_STOP_SERVICE}"
    stop_services

    # dump schema
    echo "10\n# ${MSG_SCRIPT_TRUNCATE_IN_PROGRESS}"
    $sqlite3 "${target}" ".schema" >/tmp/schema.${pid}

    # copy DB_CONFIG
    echo "20\n# ${MSG_SCRIPT_TRUNCATE_IN_PROGRESS}"
    if [ -r "${target}-journal/DB_CONFIG" ]; then
        cp "${target}-journal/DB_CONFIG" "/tmp/DB_CONFIG.${pid}"
    fi

    # remove old DB
    echo "30\n# ${MSG_SCRIPT_TRUNCATE_IN_PROGRESS}"
    rm -rf "${target}" "${target}-journal"

    # create new database
    echo "40\n# ${MSG_SCRIPT_TRUNCATE_IN_PROGRESS}"
    $sqlite3 "${target}" ".read /tmp/schema.${pid}"

    # recover DB
    echo "50\n# ${MSG_SCRIPT_TRUNCATE_IN_PROGRESS}"
    if [ -r "/tmp/DB_CONFIG.${pid}" ]; then
        mv "/tmp/DB_CONFIG.${pid}" "${target}-journal/DB_CONFIG"
        $db_recover -h "${target}-journal"
    fi

    # restart services
    echo "90\n# ${MSG_SCRIPT_TRUNCATE_START_SERVICE}"
    start_services
}

if [ -w ${target} ]; then

    do_truncate | $DIALOG --progress \
          --title="${MSG_SCRIPT_TRUNCATE_TITLE}" \
          --text="${MSG_SCRIPT_TRUNCATE_START}" \
          --cancel-label="CX" \
          --percentage=0 --auto-close --width=480 --height=240

fi
