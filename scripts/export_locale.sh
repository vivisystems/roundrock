#!/bin/sh

# change dir to profile extension directory 
#echo "1. changing directory to $2"
cd $2

# move existing install file to /tmp
#echo "2. moving origin install.rdf to tmp"
mv -f install.rdf /tmp/install.rdf

# copy new install.rdf into current directory
#echo "3. copying new install.rdf from $3"
mv -f "$3" ./install.rdf

# generate installation package
#echo "4. creating XPI archive at $1"
zip -r "/tmp/$1" *

# move installation package to media
#echo "5. moving XPI archive to media"
mv -f "/tmp/$1" "$4"

# restore original install.rdf
#echo "6. moving original install.rdf back"
mv -f /tmp/install.rdf install.rdf

/bin/sync

/bin/sync

