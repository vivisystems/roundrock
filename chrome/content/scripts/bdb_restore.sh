#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

# load L10n messages
script_path=`dirname "${0}"`
. "${script_path}"/l10n_messages

restore_dir=${1}
restore_with_system=$2
error_file=${3:-/tmp/restore.status}
target_dir=${4:-/data/databases}

BERKELEY_HOME=/usr/local/BerkeleyDB.5.0
db_recover=${BERKELEY_HOME}/bin/db_recover
sqlite3=/usr/bin/sqlite3

notify_start() {

    echo "notify vivipos start"
    # notify vivipos client we are now restore
    #curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_starting" -o /dev/null

}

notify_finish() {

    echo "notify vivipos finished"
    # notify vivipos client we are now restore
    #curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_finished" -o /dev/null

}

#
# start services that access the databases
#
start_services() {
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

do_restore() {

    if [ -n "${restore_dir}" -a -d "${restore_dir}" ]; then

        # check current DB disk usage
        echo "0\n# ${MSG_SCRIPT_RESTORE_STEP_01}"
        sync; sleep 1; sync;
        CURRENT_DB_USAGE=`LC_ALL=c du -b -c ${target_dir}/vivipos*.sqlite* | grep 'total' | awk '{print $1}'`

        # compute disk space needed for the backups
        prog=10
        DBS=`cd "$restore_dir"; ls vivipos*.sqlite`
        for db in ${DBS}; do

            base=`echo ${db} | awk -F '.' '{print $1}'`

            # run db_recover
            prog=$((prog+2))
            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_02} [${base}]"
            sudo ${db_recover} -h "${restore_dir}/${db}-journal"

            # remove all unneeded logs
            prog=$((prog+2))
            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_02} [${base}]"
            LOGS=`cd "${restore_dir}/${db}-journal"; ls log.*`
            set -- ${LOGS}
            while [ $# -gt 1 ]; do
                sudo /bin/rm -f "${restore_dir}/${db}-journal/${1}";
                shift
            done

            # perform catastrophic recovery
            prog=$((prog+2))
            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_02} [${base}]"
            sudo ${dbrecover} -c -h "${restore_dir}/${db}-journal";

            # run sqlite3 to generate index files
            prog=$((prog+2))
            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_02} [${base}]"
            sudo ${sqlite3} "${restore_dir}/${db}" ".q"

        done
        sync; sleep 1; sync;

        # determine size of recovered database files
        RESTORE_DB_USAGE=`LC_ALL=c du -b -c ${restore_dir}/vivipos*.sqlite* | grep 'total' | awk '{print $1}'`
        SPACE_NEEDED=$((RESTORE_DB_USAGE-CURRENT_DB_USAGE))

        # determine if there is enough diskspace for database recovery
        AVAILABLE_SPACE=`LC_ALL=c df -B 1 -P "${target_dir}" | grep -v "Filesystem" | awk -F " " '{ print $4}'`
        AVAILABLE_SPACE=$((AVAILABLE_SPACE-20*1024*1024))

        if [ ${SPACE_NEEDED} -gt ${AVAILABLE_SPACE} ]; then
            echo "100\n# ${MSG_SCRIPT_RESTORE_OUT_OF_DISKSPACE}"
            echo "${MSG_SCRIPT_RESTORE_OUT_OF_DISKSPACE} [${SPACE_NEEDED}, ${AVAILABLE_SPACE}]" > "${error_file}"
            exit 1
        fi

        # notify vivipos client we are now restore
        #curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_starting" -o /dev/null

        prog=$((prog+2))
        echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_03} [${base}]"
        stop_services

        # restore database
        DBS=`cd "$restore_dir"; ls vivipos*.sqlite`
        for db in ${DBS}; do

            base=`echo ${db} | awk -F '.' '{print $1}'`
            prog=$((prog+2))
            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_04} [${base}]"

            sudo cp -r "${restore_dir}/${db}"* "${target_dir}"
            sudo chown -R root:root "${target_dir}/${db}"*
            sudo chmod -R 0775 "${target_dir}/${db}"*

        done

        # remove backup directory
        if [ -d "${target_dir}/backup" ]; then
            sudo /bin/rm -rf "${target_dir}/backup"
        fi

        prog=$((prog+2))
        echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_05}"
        start_services

        # restore profile
        echo "75\n# ${MSG_SCRIPT_RESTORE_STEP_06}"

        if [ -f "$restore_dir/profile.tbz" ]; then
            tar xjpf $restore_dir/profile.tbz --exclude="./chrome/userChrome.css" --exclude="./chrome/userConfigure.js" -C /data/profile
        fi

        # restore images
        echo "80\n# ${MSG_SCRIPT_RESTORE_STEP_07}"

        if [ -f "$restore_dir/images.tbz" ]; then
            tar xjpf $restore_dir/images.tbz -C /data/images
        fi

        # restore system
        echo "85\n# ${MSG_SCRIPT_RESTORE_STEP_08}"

        if [ -f "$restore_dir/system.tbz" ] && [ "$restore_with_system" = "with-system" ]; then
            tar xjpf $restore_dir/system.tbz -C /data/system
            cp -fr /data/system/* /
        fi

        # notify vivipos client we are now restore
        #curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_finished" -o /dev/null

        echo "90\n# ${MSG_SCRIPT_RESTORE_STEP_09}"
        sync;

	fi

	echo "100\n# ${MSG_SCRIPT_RESTORE_FINISHED}"

}

/bin/rm -f "${error_file}"

# running restore
do_restore | $DIALOG --progress \
          --title="${MSG_SCRIPT_RESTORE_TITLE}" \
          --text="${MSG_SCRIPT_RESTORE_START}" \
          --percentage=0 --auto-close --width=480 --height=240
#do_restore

exit 0

