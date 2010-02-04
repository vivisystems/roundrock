#!/bin/sh

: ${DIALOG=zenity}

# set X11 DISPLAY if zero
if [ -z "$DISPLAY" ]; then
  export DISPLAY=:0
fi

bak=/data/backups

bak_dir=`date +%Y%m%d`

backup_with_profile=$1

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

        # check if second bacup media exists
        if [ -h "/dev/disk/by-label/VIVIBACKUP" ]; then
            echo "90\n# Copy to Second Backup Media.."

            # mkdir mount point
            if [ ! -d "/tmp/VIVIBACKUP" ]; then
                mkdir /tmp/VIVIBACKUP
            fi

            LAST_BACKUP_USAGE=`LC_ALL=c du -b -c $bak/$bak_dir | grep 'total' | awk '{print $1}'`

            mount /dev/disk/by-label/VIVIBACKUP /tmp/VIVIBACKUP

            if [ "$?" -eq "0" ]; then

                # check free space
                while [ `LC_ALL=c df -B 1 -P /tmp/VIVIBACKUP | grep -v "Filesystem" | awk -F " " '{ print $4}'` -lt "$LAST_BACKUP_USAGE" ]; do
                    # remove oldest backup dir
                    oldest_bak=`ls /tmp/VIVIBACKUP/backups | sort | line`
                    if [ ! -z "$oldest_bak" ]; then
                        rm -fr /tmp/VIVIBACKUP/backups/$oldest_bak
                    fi
                done

                if [ ! -d "/tmp/VIVIBACKUP/backups" ]; then
                    mkdir /tmp/VIVIBACKUP/backups
                fi

                cp -fr $bak/$bak_dir /tmp/VIVIBACKUP/backups

                sync;

                umount /tmp/VIVIBACKUP

            fi

        fi

	echo "100\n# Finished."

}

# running backup
do_backup | $DIALOG --progress \
          --title="Backup System" \
          --text="Scanning backup directory ..." \
          --percentage=0 --auto-close --width=480 --height=240

exit 0

