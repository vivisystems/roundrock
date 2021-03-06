#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

# back up profile as well?
backup_with_profile=$1
backup_destination=${2:-secondary}
database_dir=/data/databases

# include /data/profile/sync_settings.ini - this defines machine_id
if [ -f /data/profile/sync_settings.ini ]; then
    . /data/profile/sync_settings.ini
fi

# retrieve branch id from database
if [ -f ${database_dir}/vivipos.sqlite ]; then
    branch_id=`/usr/bin/sqlite3 ${database_dir}/vivipos.sqlite "SELECT branch_id FROM store_contacts WHERE terminal_no='${machine_id}'"`
fi

BDB_HOME=/usr/local/BerkeleyDB.5.1
BDB_RECOVER=${BDB_HOME}/bin/db_recover

BACKUP_DEV=/dev/disk/by-label/BACKUP
#ALL_DBS="vivipos vivipos_acl vivipos_extension vivipos_inventory vivipos_journal vivipos_order vivipos_table"
ALL_DBS="vivipos vivipos_order"
bak_dir=`date +%Y%m%d`

MYID=`id -un`
MYGROUP=`id -gn`

# check if BACKUP_DEV is available
check_device() {
    bak=""

    if [ -h "$BACKUP_DEV" ]; then

        # mkdir mount point
        if [ ! -d "/tmp/BACKUP" ]; then
            mkdir /tmp/BACKUP
        fi

        sudo mount $BACKUP_DEV /tmp/BACKUP

        if [ "$?" -eq "0" ]; then

            # check system_backups exists?
            CF_BACKUP_DIR=/tmp/BACKUP/system_backup
            if [ ! -d "${CF_BACKUP_DIR}" ]; then
                sudo mkdir ${CF_BACKUP_DIR}
            fi

            # change ownership and permission on destination directory
            sudo chown -R $MYID:$MYGROUP ${CF_BACKUP_DIR}
            chmod ug+rwx ${CF_BACKUP_DIR}

            # if has branch id check dir exists ?
            if [ ! -z "${branch_id}" ]; then
                CF_BACKUP_DIR=${CF_BACKUP_DIR}/${branch_id}
            fi
            if [ ! -d "${CF_BACKUP_DIR}" ]; then
                mkdir ${CF_BACKUP_DIR}
            fi

            # if has machine id check dir exists ?
            if [ ! -z "${machine_id}" ]; then
                CF_BACKUP_DIR=${CF_BACKUP_DIR}/${machine_id}
            fi
            if [ ! -d "${CF_BACKUP_DIR}" ]; then
                mkdir ${CF_BACKUP_DIR}
            fi

            bak=${CF_BACKUP_DIR}
        fi
    fi
}

#
# start services that access the databases
#
start_services() {
    sudo start --no-wait lighttpd >/dev/null 2>&1
    sudo start --no-wait sync-client >/dev/null 2>&1
    sudo start --no-wait irc-client >/dev/null 2>&1
}

#
# stop services that access the databases
#
stop_services() {
    sudo stop sync-client >/dev/null 2>&1
    sudo stop irc-client >/dev/null 2>&1
    sudo stop lighttpd >/dev/null 2>&1
}

do_backup() {

    # make backup dir
    echo "0\n# ${MSG_SCRIPT_BACKUP_STEP_01}"
    sleep 1;
    if [ ! -d $bak/$bak_dir ]; then
       mkdir $bak/$bak_dir;
    else
       rm -rf $bak/$bak_dir/*
    fi

    # remove old backup dirs
    echo "5\n# ${MSG_SCRIPT_BACKUP_STEP_02}"
    sleep 1;

    all_bak_dirs=`ls $bak | sort -r`
    idx=0
    for tmp_dir in $all_bak_dirs; do
        alpha_dir=`echo $tmp_dir|sed s/[0-9]//g`
        if [ -z $alpha_dir ]; then
            idx=$((idx+1))
            if  `test $idx -gt 3` ; then
                rm -fr "$bak/$tmp_dir"
            fi
        fi
    done

    # truncate old sync logs
    echo "10\n# ${MSG_SCRIPT_BACKUP_STEP_03}"
    sleep 1;

    if [ -x /data/vivipos_webapp/sync_tools ]; then
        /data/vivipos_webapp/sync_tools truncate >/dev/null 2>&1
    fi

    # stop services
    echo "20\n# ${MSG_SCRIPT_BACKUP_STEP_04}"
    sleep 1;
    stop_services

    # backup database
    start_index=30
    echo "${start_index}\n# ${MSG_SCRIPT_BACKUP_STEP_05}"
    sleep 1;
    for db in $ALL_DBS; do

        db_env="${db}.sqlite-journal"

        # first, perform db recovery
        cd ${database_dir}/${db_env};
        ${BDB_RECOVER} -e

        # next, copy database files to backup location
        start_index=$((start_index+5))
        cd ${database_dir}/
        echo "${start_index}\n# ${MSG_SCRIPT_BACKUP_STEP_05} [${db}]"
        sleep 1;
        tar cpjf "$bak/$bak_dir/${db}.tbz" "${db}.sqlite" "${db_env}" >/dev/null 2>&1

        # lastly, sync disk
        start_index=$((start_index+5))
        echo "${start_index}\n# ${MSG_SCRIPT_BACKUP_STEP_05} [${db}]"
        sleep 1;
        sync; sleep 1; sync;
    done

    # backup backup directory
    start_index=$((start_index+5))
    echo "${start_index}\n# ${MSG_SCRIPT_BACKUP_STEP_05} [backup]"
    cd ${database_dir}
    tar cpjf "$bak/$bak_dir/backup.tbz" backup >/dev/null 2>&1

    # start services
    echo "50\n# ${MSG_SCRIPT_BACKUP_STEP_06}"
    sleep 1;
    start_services

    # backup profile
    if [ "$backup_with_profile" = "with-profile" ]; then
        echo "55\n# ${MSG_SCRIPT_BACKUP_STEP_07}"
        sleep 1;
        cd /data/profile
        tar cjvpf $bak/$bak_dir/profile.tbz --exclude="./chrome/userChrome.css" --exclude="./chrome/userConfigure.js" --exclude="./extensions*" --exclude="./Cache" --exclude="*lock*" --exclude="*sqlite*" . | xargs -l1 basename | sed "s/.*/60\n# ${MSG_SCRIPT_BACKUP_STEP_07} [\0]/g"
    fi

    #backup user prefs.js
    echo "60\n# ${MSG_SCRIPT_BACKUP_STEP_08}"
    sleep 1;
    cd /data/profile
    cp /data/profile/prefs.js $bak/$bak_dir/
    [ -f /data/profile/user.js ] && cp /data/profile/user.js $bak/$bak_dir/


    #backup images
    echo "65\n# ${MSG_SCRIPT_BACKUP_STEP_09}"
    sleep 1;
    cd /data/images
    tar cjvpf $bak/$bak_dir/images.tbz . | xargs -l1 basename | sed "s/.*/65\n# ${MSG_SCRIPT_BACKUP_STEP_09} [\0]/g"

    #backup system
    echo "80\n# ${MSG_SCRIPT_BACKUP_STEP_10}"
    sleep 1;
    cd /data/system
    cp -f /etc/vivipos.lic etc/
    cp -f /etc/environment etc/
    cp -f /etc/wvdial.conf etc/
    cp -f /etc/kbmap etc/
    cp -f /etc/timezone etc/
    cp -f /etc/localtime etc/
    cp -fr /etc/cups etc/
    cp -fr /etc/wicd etc/
    cp -fr /etc/X11 etc/
    cp -fr /var/lib/eeti.param var/lib
    cp -fr /var/lib/vivipos var/lib
    cp -f /data/profile/sync_settings.ini data/profile/
    tar cjvpf $bak/$bak_dir/system.tbz . | xargs -l1 basename | sed "s/.*/80\n# ${MSG_SCRIPT_BACKUP_STEP_10} [\0]/g"

    # record backup size
    echo "85\n# ${MSG_SCRIPT_BACKUP_STEP_11}"
    cd ${database_dir}
    LC_ALL=c du -b -c ${database_dir}/vivipos*.sqlite* ${database_dir}/backup /data/images | grep 'total' | awk '{print $1}' > "$bak/$bak_dir/diskusage"

    echo "90\n# ${MSG_SCRIPT_BACKUP_STEP_12}"
    sleep 1;
    sync;

    if [ "$backup_destination" = "local" ]; then
        echo "95\n# ${MSG_SCRIPT_BACKUP_STEP_13}"
        sleep 1;

        for backidx in 0 1 2 3 4 5 6 7 8 9; do

            BACKUP_DEV=`echo /dev/disk/by-label/BACKUP${backidx} | sed s/[0]//g`

            # check if second bacup media exists
            if [ -h "$BACKUP_DEV" ]; then

                # mkdir mount point
                if [ ! -d "/tmp/BACKUP" ]; then
                    mkdir /tmp/BACKUP
                fi

                LAST_BACKUP_USAGE=`LC_ALL=c du -b -c $bak/$bak_dir | grep 'total' | awk '{print $1}'`

                sudo mount $BACKUP_DEV /tmp/BACKUP

                if [ "$?" -eq "0" ]; then

                    # check system_backups exists?
                    CF_BACKUP_DIR=/tmp/BACKUP/system_backup
                    if [ ! -d "${CF_BACKUP_DIR}" ]; then
                        mkdir ${CF_BACKUP_DIR}
                    fi

                    # if has branch id check dir exists ?
                    if [ ! -z "${branch_id}" ]; then
                        CF_BACKUP_DIR=${CF_BACKUP_DIR}/${branch_id}
                    fi
                    if [ ! -d "${CF_BACKUP_DIR}" ]; then
                        mkdir ${CF_BACKUP_DIR}
                    fi

                    # if has machine id check dir exists ?
                    if [ ! -z "${machine_id}" ]; then
                        CF_BACKUP_DIR=${CF_BACKUP_DIR}/${machine_id}
                    fi
                    if [ ! -d "${CF_BACKUP_DIR}" ]; then
                        mkdir ${CF_BACKUP_DIR}
                    fi


                    # check free space
                    echo "95\n# ${MSG_SCRIPT_BACKUP_STEP_13} [" `basename ${BACKUP_DEV}` "]"
                    sleep 1;
                    while [ `LC_ALL=c df -B 1 -P /tmp/BACKUP | grep -v "Filesystem" | awk -F " " '{ print $4}'` -lt "$LAST_BACKUP_USAGE" ]; do
                        # remove oldest backup dir
                        oldest_bak=`ls ${CF_BACKUP_DIR} | sort | line`
                        if [ ! -z "$oldest_bak" ]; then
                            rm -fr ${CF_BACKUP_DIR}/${oldest_bak}
                        else
                            break
                        fi
                    done

                    cp -fr ${bak}/${bak_dir} ${CF_BACKUP_DIR}

                    sync;

                    sudo umount /tmp/BACKUP

                fi

            fi

        done

    fi

    # update disk usage
    if [ -x /data/scripts/diskspace_usage.sh ]; then
        sudo /data/scripts/diskspace_usage.sh
    fi

    echo "100\n# ${MSG_SCRIPT_BACKUP_FINISH}"
    sleep 1;

}

if [ "$backup_destination" = "local" ]; then
    bak=/data/backups
else
    check_device;
fi

if [ -n "$bak" -a -d "$bak" ]; then
    # running backup
    do_backup | $DIALOG --progress \
          --title="${MSG_SCRIPT_BACKUP_TITLE}" \
          --text="${MSG_SCRIPT_BACKUP_START}" \
          --percentage=0 --auto-close --width=480 --height=240

fi

if [ "$backup_destination" != "local" ]; then
    # umount device
    if [ -h "$BACKUP_DEV" ]; then
        sudo umount $BACKUP_DEV
    fi
fi

exit 0

