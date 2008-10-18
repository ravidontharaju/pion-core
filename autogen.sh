#!/bin/sh
#
# This script initializes the GNU autotools environment for Pion
#

# DO NOT USE autoheader -> config.h.in file is NOT automanaged!!!
AUTOHEADER="/bin/true"
export AUTOHEADER

# Generate configure script
autoreconf -ifs
