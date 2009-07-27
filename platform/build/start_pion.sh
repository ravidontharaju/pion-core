#!/bin/sh
ulimit -s 512
ulimit -c unlimited
DYLD_LIBRARY_PATH="./libs" LD_LIBRARY_PATH="./libs" ./pion -c config/platform.xml $1
