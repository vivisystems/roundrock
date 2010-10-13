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
safety_margin=${5:-0}

BERKELEY_HOME=/usr/local/BerkeleyDB.5.1
db_recover=${BERKELEY_HOME}/bin/db_recover
sqlite3=/usr/bin/sqlite3


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

do_restore() {

    if [ -n "${restore_dir}" -a -d "${restore_dir}" ]; then

        echo "0\n# ${MSG_SCRIPT_RESTORE_STEP_01}"
        sync; sleep 1; sync;

        # compute disk space needed for the backups
        echo "10\n# ${MSG_SCRIPT_RESTORE_STEP_02}"

        # check current DB + image disk usage
        CURRENT_DB_USAGE=`LC_ALL=c du -b -c ${target_dir}/vivipos*.sqlite* ${target_dir}/backup /data/images | grep 'total' | awk '{print $1}'`

        # determine size of recovered database files
        RESTORE_DB_USAGE=`cat "${restore_dir}/diskusage"`
        SPACE_NEEDED=$((RESTORE_DB_USAGE-CURRENT_DB_USAGE))
        # determine if there is enough diskspace for database recovery
        if [ ${SPACE_NEEDED} -ge 0 ]; then
	    AVAILABLE_SPACE=`LC_ALL=c df -B 1 -P "${target_dir}" | grep -v "Filesystem" | awk -F " " '{ print $4}'`
	    AVAILABLE_SPACE=$((AVAILABLE_SPACE-safety_margin))

	    if [ ${SPACE_NEEDED} -gt ${AVAILABLE_SPACE} ]; then
		echo "100\n# ${MSG_SCRIPT_RESTORE_OUT_OF_DISKSPACE}"
		echo "${MSG_SCRIPT_RESTORE_OUT_OF_DISKSPACE} [${SPACE_NEEDED}, ${AVAILABLE_SPACE}]" > "${error_file}"
		exit 1
	    fi
	fi

        echo "20\n# ${MSG_SCRIPT_RESTORE_STEP_03}"
        stop_services

        # restore database
        prog=30
        DBS="vivipos vivipos_order"
        for db in ${DBS}; do

            echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_04} [${db}]"
            if [ -f "${restore_dir}/${db}.tbz" ]; then
                rm -rf "${target_dir}/${db}.sqlite" "${target_dir}/${db}.sqlite-journal" >/dev/null 2>&1
                prog=$((prog+5))

                echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_04} [${db}]"
                tar xpf "${restore_dir}/${db}.tbz" -C "${target_dir}" >/dev/null 2>&1
                prog=$((prog+5))
            else
                prog=$((prog+10))
            fi

        done

        # remove backup directory
        echo "${prog}\n# ${MSG_SCRIPT_RESTORE_STEP_04} [backup]"
        if [ -f "${restore_dir}/backup.tbz" ]; then
            /bin/rm -rf "${target_dir}/backup" >/dev/null 2>&1
            tar xpf "${restore_dir}/backup.tbz" -C "${target_dir}" >/dev/null 2>&1
        fi

        # restore profile
        echo "60\n# ${MSG_SCRIPT_RESTORE_STEP_05}"

        if [ -f "$restore_dir/profile.tbz" ]; then
            tar xpf $restore_dir/profile.tbz --exclude="./chrome/userChrome.css" --exclude="./chrome/userConfigure.js" --exclude="./extensions" --exclude="extensions" -C /data/profile >/dev/null 2>&1
        fi

        # restore images
        echo "70\n# ${MSG_SCRIPT_RESTORE_STEP_06}"

        if [ -f "$restore_dir/images.tbz" ]; then
            tar xpf $restore_dir/images.tbz -C /data/images >/dev/null 2>&1
        fi

        # restore system
        echo "80\n# ${MSG_SCRIPT_RESTORE_STEP_07}"

        if [ -f "$restore_dir/system.tbz" -a "$restore_with_system" = "with-system" ]; then
            tar xpf $restore_dir/system.tbz -C / >/dev/null 2>&1
        fi

        echo "85\n# ${MSG_SCRIPT_RESTORE_STEP_08}"
        sync;

        # resume web services
        echo "90\n# ${MSG_SCRIPT_RESTORE_STEP_09}"
        start_services

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

