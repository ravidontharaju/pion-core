#!/bin/sh
#
# This script initializes the GNU autotools environment for Pion
#

# DO NOT USE autoheader -> config.h.in file is NOT automanaged!!!
#autoheader

# create aclocal.m4
aclocal -I common/build

# Install libtool and related files
if test -f "/usr/local/bin/libtoolize"; then
	/usr/local/bin/libtoolize --force
elif test -f "/usr/local/bin/glibtoolize"; then
	/usr/local/bin/glibtoolize --force
elif test -f "/usr/bin/libtoolize"; then
	/usr/bin/libtoolize --force
elif test -f "/usr/bin/glibtoolize"; then
	/usr/bin/glibtoolize --force
else
	echo "Error: could not find libtoolize"
	exit
fi

# Generate configure script
autoconf
automake -a
