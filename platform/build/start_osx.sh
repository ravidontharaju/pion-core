#!/bin/sh

cd "$1/Contents/Resources/"
export DYLD_LIBRARY_PATH="./libs"
./pion -c config/platform.xml