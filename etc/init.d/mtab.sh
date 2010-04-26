#! /bin/sh
### BEGIN INIT INFO
# Provides:          mtab
# Required-Start:    mountall
# Required-Stop:
# Default-Start:     S
# Default-Stop:
# Short-Description: Update mtab file.
# Description:       Update the mount program's mtab file after
#                    all local filesystems have been mounted.
### END INIT INFO

PATH=/lib/init:/sbin:/bin
TTYGRP=5
TTYMODE=620
[ -f /etc/default/devpts ] && . /etc/default/devpts

TMPFS_SIZE=
[ -f /etc/default/tmpfs ] && . /etc/default/tmpfs

KERNEL="$(uname -s)"

. /lib/lsb/init-functions
. /lib/init/mount-functions.sh

domtab ()
{
	# Directory present?
	if [ ! -d $2 ]
	then
		return
	fi

	# Not mounted?
	if ! mountpoint -q $2
	then
		return
	fi

	if [ -n "$3" ]
	then
		NAME="$3"
	else
		NAME="$1"
	fi

	# Already recorded?
	if ! grep -E -sq "^([^ ]+) +$2 +" /etc/mtab
	then
		mount -f -t $1 $OPTS $4 $NAME $2
	fi
}

do_start () {
	DO_MTAB=""
	MTAB_PATH="$(readlink -f /etc/mtab || :)"
	case "$MTAB_PATH" in
	  /proc/*)
		# Assume that /proc/ is not writable
		;;
	  /*)
		# Only update mtab if it is known to be writable
		# Note that the touch program is in /usr/bin
		#if ! touch "$MTAB_PATH" >/dev/null 2>&1
		#then
		#	return
		#fi
		;;
	  "")
		[ -L /etc/mtab ] && MTAB_PATH="$(readlink /etc/mtab)"
		if [ "$MTAB_PATH" ]
		then
			log_failure_msg "Cannot initialize ${MTAB_PATH}."
		else
			log_failure_msg "Cannot initialize /etc/mtab."
		fi
		;;
	  *)
		log_failure_msg "Illegal mtab location '${MTAB_PATH}'."
		;;
	esac

	#
	# Initialize mtab file if necessary
	#
	if [ ! -f /etc/mtab ]
	then
		:> /etc/mtab
		chmod 644 /etc/mtab
	fi
	if selinux_enabled && which restorecon >/dev/null 2>&1 && [ -r /etc/mtab ]
	then
		restorecon /etc/mtab
	fi

	# S01mountkernfs.sh
	domtab proc /proc "proc" -onodev,noexec,nosuid
	domtab sysfs /sys "sys" -onodev,noexec,nosuid
	domtab tmpfs /var/run "varrun" -omode=0755,nodev,noexec,nosuid
	domtab tmpfs /var/lock "varlock" -omode=1777,nodev,noexec,nosuid

	# 
	# Make VIVIPOS Run as Read-Only file system
	#
	#domtab tmpfs /var/crash "varcrash" -omode=0755,nodev,noexec,nosuid
	domtab tmpfs /var/spool/cups "varspoolcups" -omode=0710,nodev,noexec,nosuid


	domtab usbfs /proc/bus/usb "procbususb"

	# S10udev
	domtab tmpfs /dev "udev" -omode=0755

	# S02mountdevsubfs
	SHM_OPT=
	[ "${SHM_SIZE:=$TMPFS_SIZE}" ] && SHM_OPT="-osize=$SHM_SIZE"
	domtab tmpfs /dev/shm "devshm" $SHM_OPT
	domtab devpts /dev/pts "devpts" -ogid=$TTYGRP,mode=$TTYMODE

	# S07linux-restricted-modules-common
	exec 9<&0 0</proc/mounts
	while read FDEV FDIR FTYPE FOPTS REST
	do
		case "$FDIR" in
			/lib/modules/*/volatile)
				domtab "$FTYPE" "$FDIR" "lrm"
				;;
		esac
	done
	exec 0<&9 9<&-

	# /etc/network/if-up.d/mountnfs
	exec 9<&0 </etc/fstab
	while read FDEV FDIR FTYPE FOPTS REST
	do
		case "$FDEV" in
		  ""|\#*)
			continue
			;;
		esac
		case "$FOPTS" in
		  noauto|*,noauto|noauto,*|*,noauto,*)
			continue
			;;
		esac
		case "$FTYPE" in
		  nfs|nfs4|smbfs|cifs|coda|ncp|ncpfs|ocfs2|gfs)
		  	domtab "$FTYPE" "$FDIR" "$FDEV" "-o$FOPTS"
			;;
		  *)
			continue
			;;
		esac
        done
        exec 0<&9 9<&-

	
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
	echo "Usage: mountall-mtab.sh [start|stop]" >&2
	exit 3
	;;
esac

:
