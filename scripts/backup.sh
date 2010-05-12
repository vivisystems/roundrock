#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

bak=/data/backups

bak_dir=`date +%Y%m%d`

backup_with_profile=$1

# include /data/profile/sync_settings.ini
if [ -f /data/profile/sync_settings.ini ]; then
    . /data/profile/sync_settings.ini
fi

if [ -f /data/databases/vivipos.sqlite ]; then
    branch_id=`/usr/bin/sqlite3 /data/databases/vivipos.sqlite "SELECT branch_id FROM store_contacts WHERE terminal_no='${machine_id}'"`
fi


notify_start() {

	echo "notify vivipos start"	
	# notify vivipos client we are now backup
	#curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=backup_starting" -o /dev/null

}

notify_finish() {

	echo "notify vivipos finished"
	# notify vivipos client we are now backup
	#curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=backup_finished" -o /dev/null

}

do_backup() {

	# make backup dir
	echo "10\n# Creating backup dir"
	if [ ! -d $bak/$bak_dir ]; then
	   mkdir $bak/$bak_dir;
	fi

	# remove all backdup dir
	echo "20\n# Removing old backdups"

	all_bak_dirs=`ls $bak | sort -r`
	idx=0
	for tmp_dir in $all_bak_dirs; do
		alpha_dir=`echo $tmp_dir|sed s/[0-9]//g`
		if [ -z $alpha_dir ]; then 
			idx=$((idx+1))
			if  `test $idx -gt 7` ; then
			rm -fr "$bak/$tmp_dir"
			fi
		fi
	done

	# truncate old sync logs
	echo "30\n# Truncate old sync logs"

	if [ -x /data/vivipos_webapp/sync_tools ]; then
		/data/vivipos_webapp/sync_tools truncate
	fi

	# backup database
	echo "40\n# Backup 'databases'"
	cd /data/databases;
	tar cjvpf $bak/$bak_dir/databases.tbz . | xargs -l1 basename | sed "s/.*/40\n# \0/g"

	# backup profile
	if [ "$backup_with_profile" = "with-profile" ]; then
	echo "50\n# Backup 'profile'"
	cd /data/profile
	tar cjvpf $bak/$bak_dir/profile.tbz --exclude="./chrome/userChrome.css" --exclude="./chrome/userConfigure.js" . | xargs -l1 basename | sed "s/.*/50\n# \0/g"
	fi

	#backup user prefs.js
	echo "55\n# Backup 'prefs.js'"
	cd /data/profile
	cp /data/profile/prefs.js $bak/$bak_dir/
    [ -f /data/profile/user.js ] && cp /data/profile/user.js $bak/$bak_dir/


	#backup images
	echo "60\n# Backup 'images'"
	cd /data/images
	tar cjvpf $bak/$bak_dir/images.tbz . | xargs -l1 basename | sed "s/.*/60\n# \0/g"

	#backup system
	echo "70\n# Backup 'system settings'"
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
	tar cjvpf $bak/$bak_dir/system.tbz . | xargs -l1 basename | sed "s/.*/70\n# \0/g"

	echo "80\n# Syncing disk.."
	sync;

	# update disk usage
	if [ -x /data/scripts/diskspace_usage.sh ]; then
		/data/scripts/diskspace_usage.sh
	fi

        echo "90\n# Copy to Second Backup Media.."

        for backidx in 0 1 2 3 4 5 6 7 8 9; do

            BACK_DEV=`echo /dev/disk/by-label/BACKUP${backidx} | sed s/[0]//g`

            # check if second bacup media exists
            if [ -h "$BACK_DEV" ]; then

                # mkdir mount point
                if [ ! -d "/tmp/BACKUP" ]; then
                    mkdir /tmp/BACKUP
                fi

                LAST_BACKUP_USAGE=`LC_ALL=c du -b -c $bak/$bak_dir | grep 'total' | awk '{print $1}'`

                mount $BACK_DEV /tmp/BACKUP

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


echo "CF BAckup = $CF_BACKUP_DIR  $LAST_BACKUP_USAGE"

                    # check free space
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

                    umount /tmp/BACKUP

                fi

            fi

        done


	echo "100\n# Finished."

}

# running backup
do_backup | $DIALOG --progress \
          --title="Backup System" \
          --text="Scanning backup directory ..." \
          --percentage=0 --auto-close --width=480 --height=240

exit 0

