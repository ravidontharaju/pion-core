#!/bin/sh
#
# stop_pion.sh: Pion shutdown script for Unix tarball distributions

/usr/bin/killall -e -s ${1:-TERM} -- $PWD/pion
