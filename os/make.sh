#!/bin/sh
#
# VIVIPOS CF tools  
#
# racklin@gmail.com
#

BASE_DIR=`dirname $0`
ROOTFS_DIR=`cd "$BASE_DIR"; pwd`/rootfs
SQUASHFS_DIR=${BASE_DIR}/squashfs
DIST_DIR=${BASE_DIR}/distfs
TGZ_DIR=${BASE_DIR}/tgz

DISTFS_LABEL=ROUNDROCK_ROOT
BOOTFS_LABEL=ROUNDROCK_BOOT

choice=${1:-help}
RESULT=0
NOW=`date +%Y%m%d`
#MKSQUASHFS=/home/rack/bin/mksquashfs-3.4
MKSQUASHFS=mksquashfs

DRI_DRIVERS="i915"
DRI_LIBS="/usr/lib/dri"

XORG_VIDEO_DRIVERS="intel vmware"
XORG_VIDEO_LIBS=""
XORG_DRIVERS_DIR=/usr/lib/xorg/modules/drivers

do_help() {

    echo "make.sh [ help | sqfs | dist | dist-dev | dist-boot | encrypt-dist <dev> "
    echo "          full | update | clone | shrink | removetmp | databases | "
    echo "          usr.sqfs | usr-lib.sqfs | data.sqfs | var.sqfs | "
    echo "          mount | mount-bind | mount-boot | mount-encrypted <dev> "
    echo "          umount | umount-bind | umount-boot | umount-encrypted ]"

}


do_removetmp() {

    echo "* Removing log & tmp files"

    # remove /var/lib data files
    rm -rf ${ROOTFS_DIR}/var/lib/vivipos/*
    rm -rf ${ROOTFS_DIR}/var/lib/ureadahead/*
    rm -rf ${ROOTFS_DIR}/var/lib/dhcp3/*
    rm -rf ${ROOTFS_DIR}/var/lib/dbus/*

    # removing old var files
    find ${ROOTFS_DIR}/var/ -name *.old -type f -exec rm -f {} \;

    # removing log files
    find ${ROOTFS_DIR}/var/log -type f -exec rm {} \;

    rm -f ${ROOTFS_DIR}/var/backups/*.gz

    rm -f ${ROOTFS_DIR}/var/cache/lighttpd/compress/css/*

    rm -rf ${ROOTFS_DIR}/tmp/*

    rm -f ${ROOTFS_DIR}/data/profile/Cache/*

    rm -f ${ROOTFS_DIR}/data/vivipos_sdk/components/*.dat

    rm -f ${ROOTFS_DIR}/data/vivipos_sdk/log/*.log

    rm -f ${ROOTFS_DIR}/data/profile/*.dat

    find ${ROOTFS_DIR}/var/spool -type f -exec rm {} \;
}


do_usr_sqfs() {

    echo "* Creating 'usr.sqfs' from /usr"

    if [ -f ${SQUASHFS_DIR}/usr.sqfs ]; then
	rm ${SQUASHFS_DIR}/usr.sqfs
    fi

    ${MKSQUASHFS} ${ROOTFS_DIR}/usr/share \
    		  ${ROOTFS_DIR}/usr/bin \
    		  ${ROOTFS_DIR}/usr/include \
    		  ${ROOTFS_DIR}/usr/local \
    		  ${ROOTFS_DIR}/usr/sbin \
    		  ${SQUASHFS_DIR}/lib \
    		  ${SQUASHFS_DIR}/usr.sqfs \
		  -ef ${BASE_DIR}/exclude_from_sqfs \
		  -b 262144

}


do_usr_lib_sqfs() {

    echo "* Creating 'usr-lib.sqfs' from /usr/lib"

    if [ -f ${SQUASHFS_DIR}/usr-lib.sqfs ]; then
	rm ${SQUASHFS_DIR}/usr-lib.sqfs
    fi

    ${MKSQUASHFS} ${ROOTFS_DIR}/usr/lib/grub \
    		  ${ROOTFS_DIR}/usr/lib/pymodules \
    		  ${ROOTFS_DIR}/usr/lib/pyshared \
    		  ${ROOTFS_DIR}/usr/lib/python2.6 \
    		  ${ROOTFS_DIR}/usr/lib/python3.1 \
    		  ${ROOTFS_DIR}/usr/lib/ImageMagick-6.5.7 \
    		  ${ROOTFS_DIR}/usr/lib/perl \
    		  ${ROOTFS_DIR}/usr/lib/GMABooster \
    		  ${ROOTFS_DIR}/usr/lib/gconv \
    		  ${ROOTFS_DIR}/usr/lib/gtk-2.0 \
    		  ${ROOTFS_DIR}/usr/lib/cgi-bin \
    		  ${ROOTFS_DIR}/usr/lib/locale \
    		  ${ROOTFS_DIR}/usr/lib/apt \
    		  ${ROOTFS_DIR}/usr/lib/gnupg \
    		  ${ROOTFS_DIR}/usr/lib/klibc \
    		  ${ROOTFS_DIR}/usr/lib/openssh \
    		  ${ROOTFS_DIR}/usr/lib/perl5 \
    		  ${ROOTFS_DIR}/usr/lib/php5 \
    		  ${ROOTFS_DIR}/usr/lib/sasl2 \
    		  ${ROOTFS_DIR}/usr/lib/ssl \
    		  ${SQUASHFS_DIR}/usr-lib.sqfs \
		  -ef ${BASE_DIR}/exclude_from_sqfs \
		  -b 262144

}


do_data_sqfs() {

    echo "* Creating 'data.sqfs' from:"
    echo "  - /data/vivipos_sdk"
    echo "  - /data/profile"
    echo "  - /data/scripts"

    if [ -f ${SQUASHFS_DIR}/data.sqfs ]; then
	rm ${SQUASHFS_DIR}/data.sqfs
    fi

    echo
    echo "* Cleaning up profile databases:"

    if [ -d ${ROOTFS_DIR}/data/profile/cookies.sqlite-journal ]; then
	echo "  - /data/profile/cookies.sqlite"
	rm -rf ${ROOTFS_DIR}/data/profile/cookies.sqlite
	rm -f ${ROOTFS_DIR}/data/profile/cookies.sqlite-journal/__db.*
	rm -f ${ROOTFS_DIR}/data/profile/cookies.sqlite-journal/log.*
    fi

    if [ -d ${ROOTFS_DIR}/data/profile/permissions.sqlite-journal ]; then
	echo "  - /data/profile/permissions.sqlite"
	rm -rf ${ROOTFS_DIR}/data/profile/permissions.sqlite
	rm -f ${ROOTFS_DIR}/data/profile/permissions.sqlite-journal/__db.*
	rm -f ${ROOTFS_DIR}/data/profile/permissions.sqlite-journal/log.*
    fi

    if [ -d ${ROOTFS_DIR}/data/profile/places.sqlite-journal ]; then
	echo "  - /data/profile/places.sqlite"
	rm -rf ${ROOTFS_DIR}/data/profile/places.sqlite
	rm -f ${ROOTFS_DIR}/data/profile/places.sqlite-journal/__db.*
	rm -f ${ROOTFS_DIR}/data/profile/places.sqlite-journal/log.*
    fi

    ${MKSQUASHFS} ${ROOTFS_DIR}/data/vivipos_sdk \
		  ${ROOTFS_DIR}/data/profile \
		  ${ROOTFS_DIR}/data/scripts \
		  ${SQUASHFS_DIR}/data.sqfs \
		  -ef ${BASE_DIR}/exclude_from_sqfs \
		  -b 262144

}


do_var_sqfs() {

    echo "* Creating 'var-lib.sqfs' from /var"

    do_removetmp

    if [ -f ${SQUASHFS_DIR}/var-lib.sqfs ]; then
	rm ${SQUASHFS_DIR}/var-lib.sqfs
    fi

    ${MKSQUASHFS} ${ROOTFS_DIR}/var/lib \
    		  ${SQUASHFS_DIR}/var-lib.sqfs \
		  -ef ${BASE_DIR}/exclude_from_sqfs \
		  -b 262144


}


do_sqfs() {

    echo "* Creating squashfs ...."

    do_usr_sqfs

    do_usr_lib_sqfs

    do_data_sqfs

    #do_var_sqfs

}


do_mount_encrypted() {

    local partition

    if [ -z "$1" ]; then
	echo "$choice requires a device path\n"
	do_help

	exit 1;
    fi

    partition=$1

    echo "* Mapping $DISTFS_LABEL to encrypted file system on $partition"

    cryptsetup --verbose \
    	       --cipher=aes-cbc-essiv:sha256 --hash=ripemd160 --key-size=256 \
	       create $DISTFS_LABEL $partition

}


do_encrypt_dist() {

    local partition

    if [ -z "$1" ]; then
	echo "$choice requires a device path\n"
	do_help

	exit 1;
    fi

    partition=$1

    echo "* Setting up encrypted file system on $partition"

    cryptsetup --verbose --verify-passphrase \
    	       --cipher=aes-cbc-essiv:sha256 --hash=ripemd160 --key-size=256 \
	       create $DISTFS_LABEL $partition

    echo "* Creating file system on $partition"
    mkfs.ext4 -j -m 1 -O dir_index,filetype,sparse_super /dev/mapper/$DISTFS_LABEL

    e2label /dev/mapper/$DISTFS_LABEL $DISTFS_LABEL
}


do_dist_boot() {

    echo "* Creating dist boot file system"

    if [ ! -d "${DIST_DIR}" ]; then
	mkdir "${DIST_DIR}"
    fi

    do_mount_boot

    rm -fr "${DIST_DIR}"/*

    echo "* Copying rootfs/boot to dist/boot file system"

    tar cp --directory "${ROOTFS_DIR}" boot \
	   | tar xvp -C "${DIST_DIR}" > dist.log

    do_umount_boot

}


do_dist() {

    echo "* Creating dist file system"

    do_removetmp

    if [ ! -d "${DIST_DIR}" ]; then
	mkdir "${DIST_DIR}"
    fi

    do_mount

    rm -fr "${DIST_DIR}"/*

    echo "* Copying rootfs to dist file system"

    tar cp --directory "${ROOTFS_DIR}" \
    	   --exclude-from="${BASE_DIR}/exclude_to_dist" . \
	   | tar xvp -C "${DIST_DIR}" > dist.log

    echo "* Copying special files to dist file system"
    tar cp --directory "${ROOTFS_DIR}" \
    	   ./usr/bin/gnokii \
    	   ./usr/bin/wvdial \
	   | tar xvp -C "${DIST_DIR}" >> dist.log

    echo "* Copying squashfs to dist file system"

    cp "${SQUASHFS_DIR}/usr.sqfs" "${DIST_DIR}/home/squashfs"
    cp "${SQUASHFS_DIR}/usr-lib.sqfs" "${DIST_DIR}/home/squashfs"
    cp "${SQUASHFS_DIR}/data.sqfs" "${DIST_DIR}/home/squashfs"
    #cp "${SQUASHFS_DIR}/var-lib.sqfs" "${DIST_DIR}/home/squashfs"

    echo "* Copying DRI drivers to dist file system"
    for driver in ${DRI_DRIVERS}; do
	echo "  - ${driver}"
	cp "${ROOTFS_DIR}/${DRI_LIBS}/${driver}_dri.so" "${DIST_DIR}/${DRI_LIBS}/"
    done

    echo "* Copying xorg video drivers/libs to dist file system"
    for driver in ${XORG_VIDEO_DRIVERS}; do
	echo "  - ${driver}"
	cp "${ROOTFS_DIR}/${XORG_DRIVERS_DIR}/${driver}_drv.so" "${DIST_DIR}/${XORG_DRIVERS_DIR}/"
    done

    for lib in ${XORG_VIDEO_LIBS}; do
	echo "  - ${lib}"
	cp "${ROOTFS_DIR}/${XORG_DRIVERS_DIR}/lib${lib}.so" "${DIST_DIR}/${XORG_DRIVERS_DIR}/"
    done

    echo "* Copying gnokii into /sbin"
    cp "${ROOTFS_DIR}/usr/bin/gnokii" "${DIST_DIR}/sbin/gnokii"
 
    echo "* Setting up fstab for dist file system"
    cp "${ROOTFS_DIR}/etc/fstab.sqfs" "${DIST_DIR}/etc/fstab"

    echo "* Setting up resolv.conf for dist file system"
    cp "${ROOTFS_DIR}/etc/resolv.conf.dist" "${DIST_DIR}/etc/resolv.conf"

    chmod 755 "${DIST_DIR}/home/squashfs/"*

    do_umount

}


do_dist_dev() {

    echo "* Creating development dist file system"

    do_removetmp

    if [ ! -d "${DIST_DIR}" ]; then
	mkdir "${DIST_DIR}"
    fi

    do_mount

    rm -fr "${DIST_DIR}"/*

    echo "* Copying rootfs to development dist file system"

    tar cp --directory "${ROOTFS_DIR}" \
    	   --exclude-from="${BASE_DIR}/exclude_to_dist_dev" . \
	   | tar xvp -C "${DIST_DIR}"

    echo "* Copying license file to dist file system"
    cp "${ROOTFS_DIR}/etc/vivipos.lic.dist" "${DIST_DIR}/etc/vivipos.lic"
    
    do_umount

}


do_clone_dist() {

    echo "* Cloning development dist file system to [${ROOTFS_DIR}]"

    do_mount

    if [ -d "${ROOTFS_DIR}" ]; then
	rm -fr "${ROOTFS_DIR}"
    fi

    mkdir "${ROOTFS_DIR}"

    echo "* Copying from [${DIST_DIR}] to ${ROOTFS_DIR}]"

    tar cp --directory "${DIST_DIR}" \
    	   --exclude-from="${BASE_DIR}/exclude_to_clone" . \
	   | tar xvp -C "${ROOTFS_DIR}"

    do_umount

}


do_mount() {

    echo "* Mounting volume [${DISTFS_LABEL}] on ${DIST_DIR}"

    if [ -h "/dev/disk/by-label/${DISTFS_LABEL}" ]; then
    #if [ -b "/dev/mapper/${DISTFS_LABEL}" ]; then
	if [ ! -d ${DIST_DIR} ]; then
	    mkdir -p "${DIST_DIR}";
        fi

	if [ -d ${DIST_DIR} ]; then
	    #mount "/dev/disk/by-label/${DISTFS_LABEL}" "${DIST_DIR}"
	    mount "/dev/mapper/${DISTFS_LABEL}" "${DIST_DIR}"
	else
	    echo "* ERROR: mount point [${DIST_DIR}] does not exist"
	    exit 1
	fi
    else
	echo "* ERROR: volume [${DISTFS_LABEL}] is not available"
	exit 1
    fi
}


do_mount_boot() {

    echo "* Mounting volume [${BOOTFS_LABEL}] on ${DIST_DIR}"

    if [ -h "/dev/disk/by-label/${BOOTFS_LABEL}" ]; then
	if [ ! -d ${DIST_DIR} ]; then
	    mkdir -p "${DIST_DIR}";
        fi

	if [ -d ${DIST_DIR} ]; then
	    mount "/dev/disk/by-label/${BOOTFS_LABEL}" "${DIST_DIR}"
	else
	    echo "* ERROR: mount point [${DIST_DIR}] does not exist"
	    exit 1
	fi
    else
	echo "* ERROR: volume [${BOOTFS_LABEL}] is not available"
	exit 1
    fi
}


do_umount() {

    echo "* Unmounting volume [${DISTFS_LABEL}] from ${DIST_DIR}"
	
    DEV=`grep "${DIST_DIR}" /etc/mtab | awk -F" " '{print $1}'`

    if [ -z "${DEV}" ]; then
	echo "* No volume mounted on ${DIST_DIR}"
    else
	for x in "${DEV}"; do
	    INODE_DEV=`ls -iL "${x}" | awk -F" " '{print $1}'`
	    INODE_LABEL=`ls -iL "/dev/disk/by-label/${DISTFS_LABEL}" | awk -F" " '{print $1}'`
	    if [ -n "${INODE_DEV}" -a "${INODE_DEV}" = "${INODE_LABEL}" ]; then
		umount ${DIST_DIR}
	    else
		echo "* Volume [${DISTFS_LABEL}] not mounted on ${DIST_DIR}"
	    fi
	done
    fi

}


do_umount_encrypted() {

    echo "* Removing encrypted file system mapping $DISTFS_LABEL"

    cryptsetup remove $DISTFS_LABEL

}




do_umount_boot() {

    echo "* Unmounting volume [${BOOTFS_LABEL}] from ${DIST_DIR}"
	
    DEV=`grep "${DIST_DIR}" /etc/mtab | awk -F" " '{print $1}'`

    if [ -z "${DEV}" ]; then
	echo "* No volume mounted on ${DIST_DIR}"
    else
	for x in "${DEV}"; do
	    INODE_DEV=`ls -iL "${x}" | awk -F" " '{print $1}'`
	    INODE_LABEL=`ls -iL "/dev/disk/by-label/${BOOTFS_LABEL}" | awk -F" " '{print $1}'`
	    if [ -n "${INODE_DEV}" -a "${INODE_DEV}" = "${INODE_LABEL}" ]; then
		umount ${DIST_DIR}
	    else
		echo "* Volume [${BOOTFS_LABEL}] not mounted on ${DIST_DIR}"
	    fi
	done
    fi

}


do_mount_bind() {

    echo "* Binding /dev, /proc, /sys, /tmp to rootfs on ${ROOTFS_DIR}"

    mount -o bind /dev ${ROOTFS_DIR}/dev
    mount -o bind /dev/pts ${ROOTFS_DIR}/dev/pts
    mount -o bind /tmp ${ROOTFS_DIR}/tmp
    mount -o bind /proc ${ROOTFS_DIR}/proc
    mount -o bind /sys ${ROOTFS_DIR}/sys
    mount -o bind /var/run ${ROOTFS_DIR}/var/run

    # mount Download directory to make software transfer easier
    if [ ! -d ${ROOTFS_DIR}/media/software ]; then
	mkdir -p ${ROOTFS_DIR}/media/software
    fi
    mount -o bind /home/vivipos/Downloads ${ROOTFS_DIR}/media/software

}


do_umount_bind() {

    echo "* Unbinding /dev, /proc, /sys, /tmp from rootfs on ${ROOTFS_DIR}"

    umount ${ROOTFS_DIR}/dev/pts
    umount ${ROOTFS_DIR}/dev
    umount ${ROOTFS_DIR}/tmp
    umount ${ROOTFS_DIR}/proc
    umount ${ROOTFS_DIR}/sys
    umount ${ROOTFS_DIR}/var/run
    umount ${ROOTFS_DIR}/media/software

    rmdir ${ROOTFS_DIR}/media/software
}


do_shrink() {
	
	do_mount
	
	echo "Wiping VMDK  \n"
	
	vmware-vdiskmanager -p $DIST_DIR 

	do_umount

	vmware-vdiskmanager -k $BASE_DIR/vivipos_sdk.vmdk

	chmod 766 $BASE_DIR/vivipos_sdk.vmdk
	
}



do_full_tgz() {

	do_mount

	echo "Create full tgz from dist \n"
	tar czvpf $TGZ_DIR/full_$NOW.tar.gz --directory $DIST_DIR .

	do_umount


}

do_update_tgz() {

	do_mount

	echo "Create update image tgz from dist \n"

	tar czvpf $TGZ_DIR/image_$NOW.tar.gz --directory $DIST_DIR --exclude-from=$BASE_DIR/exclude_to_update .

	do_umount
}

do_databases_tgz() {

	NOWM=`date +%Y%m%d%H%M`
	
	echo "Create databases tgz \n"

	tar czvpf $TGZ_DIR/databases_$NOWM.tar.gz --directory rootfs data/databases data/training

}

# switch 
case $choice in
  usr.sqfs)
	do_usr_sqfs
    ;;
  usr-lib.sqfs)
	do_usr_lib_sqfs
    ;;
  data.sqfs)
	do_data_sqfs
    ;;
  var.sqfs)
	do_var_sqfs
    ;;
  sqfs)
	do_sqfs
    ;;
  encrypt-dist)
	do_encrypt_dist $2
	;;
  dist-boot)
	do_dist_boot
	;;
  dist)
	do_dist
	;;
  clone)
  	do_clone_dist
	;;
  mount)
	do_mount
	;;
  umount)
	do_umount
	;;
  mount-bind)
	do_mount_bind
	;;
  umount-bind)
	do_umount_bind
	;;
  mount-boot)
	do_mount_boot
	;;
  umount-boot)
	do_umount_boot
        ;;
  mount-encrypted)
	do_mount_encrypted $2
	;;
  umount-encrypted)
	do_umount_encrypted
	;;
  shrink)
	do_shrink
	;;
  full)
	do_full_tgz
	;;
  update)
	do_update_tgz
	;;
  removetmp)
	do_removetmp
	;;
  databases)
	do_databases_tgz
	;;
  dist-dev)
	do_dist_dev
	;;
  help)
	do_help
	;;
  *)
	do_help
	;;
esac

exit 0

