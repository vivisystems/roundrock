#!/bin/sh
mount | grep vivipos_data | awk -F" " '{ print $3 }' | xargs umount
