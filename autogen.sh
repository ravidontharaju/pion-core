#!/bin/sh
#
# This script initializes the GNU autotools environment for Pion
#

# DO NOT USE autoheader -> config.h.in file is NOT automanaged!!!
#autoheader

# Note: this will produce warnings after it has already been run
# but they can be safely ignored
libtoolize

aclocal -I build
autoconf
automake -a
