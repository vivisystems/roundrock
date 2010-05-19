#!/bin/sh
# /etc/acpi/powerbtn.sh
# Initiates a shutdown when the power putton has been
# pressed.

# Skip if we just in the middle of resuming.
test -f /var/lock/acpisleep && exit 0

# If gnome-power-manager, kpowersave or klaptopdaemon are running, let
# them handle policy This is effectively the same as 'acpi-support's
# '/usr/share/acpi-support/policy-funcs' file.

if pidof gnome-power-manager kpowersave > /dev/null ||
  (pidof dcopserver > /dev/null && test -x /usr/bin/dcop && /usr/bin/dcop kded kded loadedModules | grep -q klaptopdaemon) ; then
    exit
fi

# Otherwise, if KDE is found, try to ask it to logout.
# If KDE is not found, just shutdown now.
if ps -Af | grep -q '[k]desktop' && pidof dcopserver > /dev/null && test -x /usr/bin/dcop ; then
    KDESES=`pidof dcopserver | wc -w`
    if [ $KDESES -eq 1 ] ; then
        # single KDE session -> ask user
        /usr/bin/dcop --all-sessions --all-users ksmserver ksmserver logout 1 2 0
        exit 0
    else
        # more than one KDE session - just send shutdown signal to all of them
        /usr/bin/dcop --all-sessions --all-users ksmserver ksmserver logout 0 2 0 && exit 0
    fi
fi

# If VIVIPOS Running
if ps -Af | grep 'run_vivipos' | grep -v 'grep' ; then

	echo "`date +"%Y-%m-%d %H:%M:%S"` :   Power button pressed " >> /data/vivipos_sdk/log/vivipos.log

	## invoke shutdown from main_controller
	curl -m 3 -s -G "http://localhost:8888/dispatch?command=shutdownMachine&controller=Main&data=PowerButtonPressed" -o /dev/null
	
	## 5-10 seconds not shutdown , use plain shutdown 
	sleep 5
	/sbin/shutdown -h now "Power button pressed"

	exit 0
fi

# If all else failed, just initiate a plain shutdown.
/sbin/shutdown -h now "Power button pressed"
