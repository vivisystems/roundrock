#!/bin/sh

# change dir to extension directory 
#echo "1. changing directory to $1"
cd $1

# create zip archive
#echo "2. create zip archive
zip -mr $2 .

# mv zip archive to final destination
#echo "3. moving zip archive from $2 to $3"
mv -f "$2" "$3"

/bin/sync

/bin/sync

