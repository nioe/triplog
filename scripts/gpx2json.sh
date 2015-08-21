#!/bin/bash
#######################################################################################################################
# Constants
#######################################################################################################################
readonly TRIPLOG_TOOLS_JAR="/Users/nici/workspace/triplog/triplog-server-tools/target/triplog-server-tools-1.0-SNAPSHOT-jar-with-dependencies.jar"


if [ -z "$1" ]; then
    echo "Usage: Please specify .gpx File as first prameter"
    exit 1
fi

gpxFile=$1

if [ ! -f "${gpxFile}" ]; then
    echo "GPX-File '${gpxFile}' not found"
    exit 1
fi

java -jar ${TRIPLOG_TOOLS_JAR} ${gpxFile}