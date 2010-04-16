#! /bin/sh
### BEGIN INIT INFO
# Provides:          waitnfs
# Required-Start:    $network $local_fs
# Required-Stop:
# Default-Start:     S
# Default-Stop:
# Short-Description: Wait for critical network file systems to be mounted
# Description:       Network file systems are mounted in the background when
#                    interfaces are brought up; this script waits for
#                    those among them which are critical for booting to be
#                    mounted before carrying on.
#                    Specifically, it will wait for file systems mounted
#                    on /usr, /usr/*, /var, /var/* 
#                    This script WILL NOT wait on other network file which are
#                    mounted elsewhere!
### END INIT INFO

[ -f /etc/default/rcS ] && . /etc/default/rcS
. /lib/lsb/init-functions

do_start() {
	[ -f /etc/fstab ] || return
	#
	# Read through fstab line by line, building a list of networked
	# file systems mounted on /usr* or /var*
	# Wait up to a fixed period of time for these file systems to mount
	#

	exec 9<&0 </etc/fstab

	waitnfs=
	while read DEV MTPT FSTYPE OPTS REST
	do
		case "$DEV" in
		  ""|\#*)
			continue
			;;
		esac
		case "$OPTS" in
		  noauto|*,noauto|noauto,*|*,noauto,*)
			continue
			;;
		esac
		case "$FSTYPE" in
		  nfs|nfs4|smbfs|cifs|coda|ncp|ncpfs|ocfs2|gfs)
			;;
		  *)
			continue
			;;
		esac
		case "$MTPT" in
		  /usr/local|/usr/local/*)
			;;
		  /usr|/usr/*)
			waitnfs="$waitnfs $MTPT"
			;;
		  /var|/var/*)
			waitnfs="$waitnfs $MTPT"
			;;
		esac
	done

	exec 0<&9 9<&-

	# Try mounting all networked filesystems here, just before waiting for
	# them; background this call so as not to block startup sequence
	/lib/init/mountall-net-fs &

	# Wait for each path, the timeout is for all of them as that's
	# really the maximum time we have to wait anyway
	TIMEOUT=900
	for mountpt in $waitnfs; do
		log_action_begin_msg "Waiting for $mountpt"

		while ! mountpoint -q $mountpt; do
			sleep 0.1

			TIMEOUT=$(( $TIMEOUT - 1 ))
			if [ $TIMEOUT -le 0 ]; then
				log_action_end_msg 1
				break
			fi
		done

		if [ $TIMEOUT -gt 0 ]; then
			log_action_end_msg 0
		fi
	done
}

case "$1" in
    start)
        do_start
        ;;
    restart|reload|force-reload)
        echo "Error: argument '$1' not supported" >&2
        exit 3
        ;;
    stop)
        ;;
    *)
        echo "Usage: $0 start|stop" >&2
        exit 3
        ;;
esac

: exit 0
