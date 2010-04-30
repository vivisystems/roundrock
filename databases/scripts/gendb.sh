#!/bin/sh -x

#
# this script generates the VIVIPOS database set
# using the Oracle Berkeley Databases SQLite API
#

sqlite3=/usr/bin/sqlite3
script=`basename $0`
source=$1
dest=${2:-.}

PAGE_SIZE=4096
DEFAULT_MAX_PAGE_COUNT=2560

usage() {
  echo "usage: $script source [destination]"
}

if [ $# != 1 -a $# != 2 ]; then
  usage
  exit 1;
fi

if [ ! -d $source ]; then
  echo "source [$source] is not a directory!"
  exit 1
fi

if [ ! -x $source ]; then
  echo "source [$source] is not searchable!"
  exit 1
fi

if [ ! -e $dest ]; then
  mkdir -p $dest
fi

if [ ! -d $dest ]; then
  echo "destination [$dest] is not a directory!"
  exit 1
fi

if [ ! -x $dest ]; then
  echo "destination [$source] is not searchable!"
  exit 1
fi

echo "Removing existing databases from $dest..."
rm -rf ${dest}/*

echo "Generating Oracle BDB databases from schemas..."

all_schemas=`ls "$source"/*.sql`
for schema in ${all_schemas}; do

  base=`basename "$schema" .sql`
  max_page_count=$DEFAULT_MAX_PAGE_COUNT

  case $base in

    vivipos)
      max_page_count=12800	#  50MB = 256 * 50
      ;;

    vivipos_acl)
      ;;

    vivipos_extension)
      ;;

    vivipos_inventory)
      max_page_count=12800	#  50MB = 256 * 50
      ;;

    vivipos_journal)
      ;;

    vivipos_order)
      max_page_count=51200	# 200MB = 256 * 200
      ;;

    vivipos_table)
      max_page_count=5120	#  20MB = 256 * 20
      ;;

  esac

  $sqlite3 "$dest/$base.sqlite" <<EOF
PRAGMA page_size=$PAGE_SIZE;
PRAGMA max_page_count=51200;
.read $schema
EOF

done
