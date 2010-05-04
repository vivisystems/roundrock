#!/bin/sh

: ${DIALOG=zenity}

##
## load messages for base locale
##

script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

terminal=${1}
dest_path=${2:-/data/profile/last_good_db}
file=${3:-`date +%Y%m%d%H%M%S`}
img_path="/data/images"
db_path="/data/databases"
tmp_path="/data/backups/`uuid`"

##
## create temp directory
##

mkdir -p "${tmp_path}/databases"

##
## subroutine to clean up tmp directory
##
cleanup() {
    rm -rf "${tmp_path}"

    sync
}

start_clients() {
    sudo /etc/init.d/lighttpd start >/dev/null 2>&1
    sudo /data/vivipos_webapp/sync_client start >/dev/null 2>&1
    sudo /data/vivipos_webapp/irc_client start >/dev/null 2>&1
}

stop_clients() {
    sudo /data/vivipos_webapp/sync_client stop
    sudo /data/vivipos_webapp/irc_client stop
    sudo /etc/init.d/lighttpd stop
}

do_last_good_db() {

    ##
    ## proceed only if temp directory has been successfully created
    ##
    if [ -d "${tmp_path}" ]
    then

        echo "2\n# vivipos..."
        cp "${db_path}/vivipos.sqlite" "${tmp_path}/databases"

        echo "4\n# vivipos_acl..."
        cp "${db_path}/vivipos_acl.sqlite" "${tmp_path}/databases"

        echo "6\n# vivipos_extension..."
        cp "${db_path}/vivipos_extension.sqlite" "${tmp_path}/databases"

        echo "8\n# vivipos_table..."
        cp "${db_path}/vivipos_table.sqlite" "${tmp_path}/databases"

        echo "10\n# backup/..."
        cp -r "${db_path}/backup" "${tmp_path}/databases"

        echo "15\n# images/..."
        cp -r "${img_path}" "${tmp_path}"

        ##
        ## special processing for inventory database
        ##
        ## - remove all records from:
        ##   - inventory_commitments
        ##   - inventory_records
        ##   - syncs
        ##   - sync_remote_machines
        ##
        echo "20\n# vivipos_inventory..."

        cp "${db_path}/vivipos_inventory.sqlite" "${tmp_path}/databases"
        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_inventory.sqlite" "begin; delete from inventory_commitments; delete from inventory_records; delete from syncs; delete from sync_remote_machines; commit; vacuum;"

        ##
        ## special processing for journal database
        ##
        ## - remove all records from:
        ##   - journal
        ##   - syncs
        ##   - sync_remote_machines
        ##
        echo "25\n# vivipos_journal..."

        cp "${db_path}/vivipos_journal.sqlite" "${tmp_path}/databases"
        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_journal.sqlite" "begin; delete from journal; delete from syncs; delete from sync_remote_machines; commit; vacuum;"

        ##
        ## special processing for order database
        ##
        ## - initialize new vivipos_order.sqlite with schema from active vivipos_order.sqlite
        ##
        echo "30\n# vivipos_order..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" ".schema" | /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite"

        ## - export clock_stamps into new db
        echo "40\n# vivipos_order clock_stamps..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/clock_stamps.dat" <<EOF
.mode insert clock_stamps
select * from clock_stamps where clockout = 0;
EOF

        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/clock_stamps.dat"
EOF
        rm "${tmp_path}/databases/clock_stamps.dat"

        ## - export shift_markers into new db
        echo "45\n# vivipos_order shift_markers..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/shift_markers.dat" <<EOF
.mode insert shift_markers
select * from shift_markers where terminal_no = "${terminal}";
EOF

        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/shift_markers.dat"
EOF
        rm "${tmp_path}/databases/shift_markers.dat"

        ## - export uniform_invoice_markers into new db
        echo "50\n# vivipos_order uniform_invoice_markers..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/ui_markers.dat" <<EOF
.mode insert uniform_invoice_markers
select * from uniform_invoice_markers where terminal_no = "${terminal}";
EOF

        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/ui_markers.dat"
EOF
        rm "${tmp_path}/databases/ui_markers.dat"

        ## - export order queues into new db
        echo "55\n# vivipos_order order_queues..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/order_queues.dat" <<EOF
.mode insert order_queues
select * from order_queues where status = 1 and terminal_no = "${terminal}";
EOF

        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/order_queues.dat"
EOF
        rm "${tmp_path}/databases/order_queues.dat"

        ## - export stored orders into new db
        echo "60\n# vivipos_order orders..."

        /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/orders.dat" <<EOF
.mode insert orders
select * from orders where status = 2 and terminal_no = "${terminal}";
EOF

        /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/orders.dat"
EOF
        rm "${tmp_path}/databases/orders.dat"

        ## - export details for stored orders into new db
        DETAIL_TABLES="additions annotations item_condiments item_taxes items objects payments promotions receipts"
        PROGRESS=70
        for detail in ${DETAIL_TABLES}
        do
            echo "${PROGRESS}\n# vivipos_order order ${detail}..."
            PROGRESS=`expr ${PROGRESS} + 2`
            /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/databases/order_${detail}.dat" <<EOF
.mode insert "order_${detail}"
select * from "order_${detail}" where order_id in (select id from orders where status = 2 and terminal_no = "${terminal}");
EOF

            /usr/bin/sqlite3 "${tmp_path}/databases/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/databases/order_${detail}.dat"
EOF
            rm "${tmp_path}/databases/order_${detail}.dat"
        done

        ##
        ## compress
        ##
        echo "90\n# ${MSG_SCRIPT_LGDB_COMPRESS}"

        tar cjpf "${tmp_path}/${file}" -C "${tmp_path}" --exclude="${file}" .

        ##
        ## continue only if tar is successful
        ##
        if [ $? -eq 0 ]
        then

            ##
            ## create destination folder if not present
            ##
            if [ ! -d "${dest_path}" ]
            then
                mkdir -p "${dest_path}"
                if [ ! -d "${dest_path}" ]
                then
                    cleanup
                    exit 1
                fi
            fi
            ##
            ## ensure that destination file system has enough disk space
            ##
            file_size=`du -B1024 "${tmp_path}/${file}" | awk -F" " '{print $1}'`
            used_size=`du -B1024 "${dest_path}" | awk -F" " '{print $1}'`
            space_avail=`df -B1024 "${dest_path}" | grep -v "Mounted on" | awk -F" " '{print $4}'`
            total_space=`expr "${used_size}" + "${space_avail}"`

            if [ ${file_size} -lt ${total_space} ]
            then
                rm -rf "${dest_path}/"*

                echo "95\n# ${MSG_SCRIPT_LGDB_ARCHIVE}"

                cp "${tmp_path}/${file}" "${dest_path}"

                if [ $? -ne 0 ]
                then
                    ##
                    ## copy failed, remove last good database
                    ##
                    rm -rf "${dest_path}"
                fi
            fi
        fi
        cleanup
    fi
}

# stop clients
stop_clients

# running backup
do_last_good_db | $DIALOG --progress \
          --title="${MSG_SCRIPT_LGDB_CREATE}" \
          --percentage=0 --auto-close --width=480 --height=240

# start clients
start_clients

exit 0
