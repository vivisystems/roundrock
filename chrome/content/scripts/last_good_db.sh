#!/bin/sh

##
## create temp directory
##

dest_path=${1:-/data/profile/last_good_db}
file=${2:-`date +%Y%m%d%H%M%S`}
db_path="/data/databases"
tmp_path="/data/backups/`uuid`"

mkdir -p "${tmp_path}"

##
## subroutine to clean up tmp directory
##
cleanup() {
    rm -rf "${tmp_path}"

    sync
}

##
## proceed only if temp directory has been successfully created
##
if [ -d "${tmp_path}" ]
then

    cp "${db_path}/vivipos.sqlite" "${tmp_path}"
    cp "${db_path}/vivipos_acl.sqlite" "${tmp_path}"
    cp "${db_path}/vivipos_extension.sqlite" "${tmp_path}"
    cp "${db_path}/vivipos_table.sqlite" "${tmp_path}"
    cp -r "${db_path}/backup/" "${tmp_path}"

    ##
    ## special processing for inventory database
    ##
    ## - remove all records from:
    ##   - inventory_commitments
    ##   - inventory_records
    ##   - syncs
    ##   - sync_remote_machines
    ##
    cp "${db_path}/vivipos_inventory.sqlite" "${tmp_path}"
    /usr/bin/sqlite3 "${tmp_path}/vivipos_inventory.sqlite" "begin; delete from inventory_commitments; delete from inventory_records; delete from syncs; delete from sync_remote_machines; commit; vacuum;"

    ##
    ## special processing for journal database
    ##
    ## - remove all records from:
    ##   - journal
    ##   - syncs
    ##   - sync_remote_machines
    ##
    cp "${db_path}/vivipos_journal.sqlite" "${tmp_path}"
    /usr/bin/sqlite3 "${tmp_path}/vivipos_journal.sqlite" "begin; delete from journal; delete from syncs; delete from sync_remote_machines; commit; vacuum;"

    ##
    ## special processing for order database
    ##
    ## - initialize new vivipos_order.sqlite with schema from active vivipos_order.sqlite
    ##
    /usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" ".schema" | /usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite"

    ## - export shift_markers into new db
/usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/shift_markers.dat" <<EOF
.mode insert shift_markers
select * from shift_markers;
EOF

/usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/shift_markers.dat"
EOF
    rm "${tmp_path}/shift_markers.dat"

    ## - export uniform_invoice_markers into new db
/usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/ui_markers.dat" <<EOF
.mode insert uniform_invoice_markers
select * from uniform_invoice_markers;
EOF

/usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/ui_markers.dat"
EOF
    rm "${tmp_path}/ui_markers.dat"

    ## - export order queues into new db
/usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/order_queues.dat" <<EOF
.mode insert order_queues
select * from order_queues where status = 1;
EOF

/usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/order_queues.dat"
EOF
    rm "${tmp_path}/order_queues.dat"

    ## - export stored orders into new db
/usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/orders.dat" <<EOF
.mode insert orders
select * from orders where status = 2;
EOF

/usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/orders.dat"
EOF
    rm "${tmp_path}/orders.dat"

    ## - export details for stored orders into new db
DETAIL_TABLES="additions annotations item_condiments item_taxes items objects payments promotions receipts"
for detail in ${DETAIL_TABLES}
do
/usr/bin/sqlite3 "${db_path}/vivipos_order.sqlite" > "${tmp_path}/order_${detail}.dat" <<EOF
.mode insert "order_${detail}"
select * from "order_${detail}" where order_id in (select id from orders where status = 2);
EOF

/usr/bin/sqlite3 "${tmp_path}/vivipos_order.sqlite" <<EOF
.read "${tmp_path}/order_${detail}.dat"
EOF
    rm "${tmp_path}/order_${detail}.dat"
done

    ##
    ## compress
    ##
    tar cpf "${tmp_path}/${file}" -C "${tmp_path}" --exclude="${file}" .

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
