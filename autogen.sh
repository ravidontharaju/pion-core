#!/bin/sh
#
# This script initializes the GNU autotools environment for Pion
#

# DO NOT USE autoheader -> config.h.in file is NOT automanaged!!!
#autoheader

# create aclocal.m4
aclocal -I build

# Install libtool, libltdl and related files
libtoolize --ltdl --force

# Generate configure script
autoconf
automake -a
