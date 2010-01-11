#!/bin/sh

: ${DIALOG=zenity}
export DISPLAY=:0

bak=/data/backups

restore_dir=$1
restore_with_system=$2


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


do_restore() {

	if [ -d "$restore_dir" ]; then

		# notify vivipos client we are now restore 
		#curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_starting" -o /dev/null

		# restore database
		echo "40\n# Restore 'databases'"

		if [ -f "$restore_dir/databases.tbz" ]; then
			tar xjpf $restore_dir/databases.tbz -C /data/databases
			chown -R root:root /data/databases
			chmod -R 0775 /data/databases
		fi

		# restore profile
		echo "50\n# Restore 'profile'"

		if [ -f "$restore_dir/profile.tbz" ]; then
			tar xjpf $restore_dir/profile.tbz --exclude="./chrome/userChrome.css" --exclude="./chrome/userConfigure.js" -C /data/profile
		fi

		# restore images
		echo "60\n# Restore 'images'"

		if [ -f "$restore_dir/images.tbz" ]; then
			tar xjpf $restore_dir/images.tbz -C /data/images
		fi

		# restore system
		echo "70\n# Restore 'system'"

	    if [ -f "$restore_dir/system.tbz" ] && [ "$restore_with_system" = "with-system" ]; then
	            tar xjpf $restore_dir/system.tbz -C /data/system
	            cp -fr /data/system/* /
	    fi


		# notify vivipos client we are now restore 
		#curl -m 3 -s -G "http://localhost:8888/observer?topic=crontab&data=restore_finished" -o /dev/null

		echo "80\n# Syncing disk.."
		sync;

	fi

	echo "100\n# Finished."

}


# running restore
do_restore | $DIALOG --progress \
          --title="Restore System" \
          --text="Scanning backup directory ..." \
          --percentage=0 --auto-close --width=480 --height=240


exit 0

