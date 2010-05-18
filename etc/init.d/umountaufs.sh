#! /bin/sh
### BEGIN INIT INFO
# Provides:          umountaufs
# Required-Start:    sendsigs
# Required-Stop:
# Default-Start:     6
# Default-Stop:
# Short-Description: Unmount all aufs squash filesystems except the root file system.
# Description:       Also unmounts all virtual filesystems (proc, devfs, devpts,
#                    usbfs, sysfs) that are not mounted at the top level.
### END INIT INFO

PATH=/usr/sbin:/usr/bin:/sbin:/bin
KERNEL="$(uname -s)"
RELEASE="$(uname -r)"
. /lib/init/vars.sh

. /lib/lsb/init-functions

case "${KERNEL}:${RELEASE}" in
  Linux:[01].*|Linux:2.[01].*)
	FLAGS=""
	;;
  Linux:2.[23].*|Linux:2.4.?|Linux:2.4.?-*|Linux:2.4.10|Linux:2.4.10-*)
	FLAGS="-f"
	;;
  *)
	FLAGS="-f -l"
	;;
esac

do_stop () {

	log_action_begin_msg "Unmounting aufs and squash virtual filesystems"

	# umount by sequence
        umount $FLAGS /rw

        umount $FLAGS /data
        umount $FLAGS /ro/data

        umount $FLAGS /usr
        umount $FLAGS /ro/usr

        umount $FLAGS /var
        umount $FLAGS /ro/var

        umount $FLAGS /lib
        umount $FLAGS /ro/lib


	log_action_end_msg $?
}

case "$1" in
  start)
	# No-op
	;;
  restart|reload|force-reload)
	echo "Error: argument '$1' not supported" >&2
	exit 3
	;;
  stop|"")
	do_stop
	;;
  *)
	echo "Usage: umountnfs.sh [start|stop]" >&2
	exit 3
	;;
esac

:
