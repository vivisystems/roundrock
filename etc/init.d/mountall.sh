#! /bin/sh
### BEGIN INIT INFO
# Provides:          mountall
# Required-Start:    checkfs
# Required-Stop: 
# Should-Start:      lvm
# Should-Stop:
# Default-Start:     S
# Default-Stop:
# Short-Description: Mount all filesystems.
# Description:
### END INIT INFO

PATH=/sbin:/bin
. /lib/init/vars.sh

. /lib/lsb/init-functions
. /lib/init/mount-functions.sh

if [ -r /etc/default/locale ]; then
	. /etc/default/locale
	export LANG
fi

do_start() {
	#
	# Mount local file systems in /etc/fstab.
	#
	pre_mountall
	
	if [ "$VERBOSE" = no ]
	then
		log_action_begin_msg "Mounting local filesystems"
		mount -a -t proc >/dev/null 2>&1  # Ignore error message due to /proc already being mounted
		ES_TO_REPORT=$?
		mount -a -t noproc,nfs,nfs4,smbfs,cifs,ncp,ncpfs,coda,ocfs2,gfs
		ES=$?
		ES_TO_REPORT=$(($ES_TO_REPORT | $ES))
		if [ 0 = "$ES_TO_REPORT" ]
		then
			log_action_end_msg 0
		else
			log_action_end_msg 1 "code $ES_TO_REPORT"
		fi
	else
		log_action_msg "Will now mount local filesystems"
		mount -a -t proc >/dev/null 2>&1  # Ignore error message due to /proc already being mounted
		ES=$?
		[ 0 = "$ES" ] || log_failure_msg "Mounting proc filesystems failed with error code ${ES}."
		mount -a -v -t noproc,nfs,nfs4,smbfs,cifs,ncp,ncpfs,coda,ocfs2,gfs
		ES=$?
		if [ 0 = "$ES" ]
		then
			log_success_msg "Done mounting local filesystems."
		else
			log_failure_msg "Mounting local filesystems failed with error code ${ES}."
		fi
	fi

	post_mountall

	case "$(uname -s)" in
	  *FreeBSD)
		INITCTL=/etc/.initctl
		;;
	  *)
		INITCTL=/dev/initctl
		;;
	esac

	#
	# We might have mounted something over /dev, see if
	# /dev/initctl is there.
	#
	if [ ! -p $INITCTL ]
	then
		rm -f $INITCTL
		mknod -m 600 $INITCTL p
	fi
	kill -USR1 1

	#
	# Execute swapon command again, in case we want to swap to
	# a file on a now mounted filesystem.
	#
	# Ignore 255 status due to swap already being enabled
	#
	if [ "$VERBOSE" = no ]
	then
		log_action_begin_msg "Activating swapfile swap"
		swapon -a -e 2>/dev/null || :  # Stifle "Device or resource busy"
		log_action_end_msg 0
	else
		log_action_msg "Will now activate swapfile swap"
		swapon -a -e -v || :
		log_success_msg "Done activating swapfile swap."
	fi
}

case "$1" in
  start|"")
	do_start
	;;
  restart|reload|force-reload)
	echo "Error: argument '$1' not supported" >&2
	exit 3
	;;
  stop)
	# No-op
	;;
  *)
	echo "Usage: mountall.sh [start|stop]" >&2
	exit 3
	;;
esac

:
