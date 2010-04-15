#!/bin/sh

source=$1
target=${2:-/data/databases/}

#echo "${source} ${target}" > /tmp/restore.log

if [ -r "${source}" -a -d "${target}" ]
then

    #echo "tar xf ${source} -C ${target}" >> /tmp/restore.log

    tar xvf "${source}" -C "${target}" #>> /tmp/restore.log
    chmod 0666 "${target}"/*.sqlite
    sync
fi
