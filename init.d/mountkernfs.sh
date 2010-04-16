#! /bin/sh
### BEGIN INIT INFO
# Provides:          mountkernfs
# Required-Start:
# Required-Stop:
# Default-Start:     S
# Default-Stop:
# Short-Description: Mount kernel virtual file systems.
# Description:       Mount initial set of virtual filesystems the kernel
#                    provides and that are required by everything.
### END INIT INFO

PATH=/lib/init:/sbin:/bin

. /lib/lsb/init-functions
. /lib/init/mount-functions.sh

do_start () {
	#
	# Mount proc filesystem on /proc
	#
	domount proc "" /proc -onodev,noexec,nosuid

	#
	# Mount sysfs on /sys
	#
	domount sysfs "" /sys -onodev,noexec,nosuid

	# Mount /var/run and /var/lock as tmpfs.
	domount tmpfs "" /var/run -omode=0755,nodev,noexec,nosuid
	domount tmpfs "" /var/lock -omode=1777,nodev,noexec,nosuid

	# 
	# Make VIVIPOS Run as Read-Only file system
	#
	#domount tmpfs "" /var/tmp -omode=1777,nodev,noexec,nosuid
	#domount tmpfs "" /var/crash -omode=0755,nodev,noexec,nosuid

	domount tmpfs "" /var/spool/cups -omode=0710,nodev,noexec,nosuid
	chgrp lp /var/spool/cups
	mkdir /var/spool/cups/tmp
	chmod 1770 /var/spool/cups/tmp
	chgrp lp /var/spool/cups/tmp

	domount tmpfs "" /tmp -omode=1777,nodev,exec,nosuid
	touch /tmp/resolv.conf
	touch /tmp/adjtime

	# this is necessary to avoid that the above files are removed later in the boot process
	touch /tmp/.clean

	domount tmpfs "" /media -omode=0755,nodev,noexec,nosuid
	mkdir /media/cdrom0
	ln -s /media/cdrom0 /media/cdrom
	mkdir /media/floppy0
	ln -s /media/floppy0 /media/floppy



	# Mount spufs, if Cell Broadband processor is detected
	if mountpoint -q /proc && grep -qs '^cpu.*Cell' /proc/cpuinfo; then
		mkdir -p /spu
		domount spufs "" /spu -ogid=spu
	fi

	# Propagate files from the initramfs to our new /var/run.
	for file in /dev/.initramfs/varrun/*; do
		[ -e "$file" ] || continue
		cp -a "$file" "/var/run/${x#/dev/.initramfs/varrun/}"
	done

	if [ ! -d /var/run/sendsigs.omit.d/ ]; then
		mkdir /var/run/sendsigs.omit.d/
	fi
}

case "$1" in
  "")
	echo "Warning: mountvirtfs should be called with the 'start' argument." >&2
	do_start
	;;
  start)
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
	echo "Usage: mountvirtfs [start|stop]" >&2
	exit 3
	;;
esac
