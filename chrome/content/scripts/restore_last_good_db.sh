#!/bin/sh

source=$1
target=${2:-/data}

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

echo "restoring last good db at ${source} into ${target}" > /tmp/restore.log

stop_clients

if [ -r "${source}" -a -d "${target}" ]
then

    echo "tar xjpf ${source} -C ${target}" >> /tmp/restore.log

    rm -rf "${target}/images/"*
    rm -rf "${target}/databases/backup/"*

    tar xjpvf "${source}" -C "${target}" >> /tmp/restore.log
    chmod 0666 "${target}/databases"/*.sqlite
    sync
fi

start_clients

