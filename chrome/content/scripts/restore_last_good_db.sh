#!/bin/sh

source=$1
target=${2:-/data}

echo "restoring last good db at ${source} into ${target}" > /tmp/restore.log

if [ -r "${source}" -a -d "${target}" ]
then

    echo "tar xjpf ${source} -C ${target}" >> /tmp/restore.log

    rm -rf "${target}/images/"*
    rm -rf "${target}/databases/backup/"*

    tar xjpvf "${source}" -C "${target}" >> /tmp/restore.log
    chmod 0666 "${target}/databases"/*.sqlite
    sync
fi
