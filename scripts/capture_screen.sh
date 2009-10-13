#!/bin/sh -x

imageFile=$1
thumbFile=$2
imageSize=$3
thumbSize=$4

tmpFile=/tmp/$$.png

import -window root ${tmpFile}
convert ${tmpFile} -resize $imageSize ${imageFile}
convert ${tmpFile} -resize $thumbSize ${thumbFile}

rm ${tmpFile}

