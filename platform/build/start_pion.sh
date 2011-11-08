#!/bin/sh
#
# start_pion.sh: Pion startup script for Unix tarball distributions

# Limit pion's maximum virtual memory size by physical memory minus MEM_RESERVE
# MEM_RESERVE is a percentage value from 0 through 100 (default = reserve 5%)
MEM_RESERVE=5

# Set global ulimits for all platforms
ulimit -s 512
ulimit -c unlimited

# LINUX ONLY: Set maximum virtual memory
if [ -r /proc/meminfo ]; then
	ulimit -v $((`sed -n 's/^MemTotal: *\([0-9]*\).*$/\1/p' /proc/meminfo`*(100 - $MEM_RESERVE)/100))
fi

DYLD_LIBRARY_PATH="./libs" LD_LIBRARY_PATH="./libs" $PWD/pion -c config/platform.xml "$@"
