# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

ACLOCAL_AMFLAGS = -I common/build

SUBDIRS = @PION_COMMON_MAKEDIRS@ @PION_NET_MAKEDIRS@ platform

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-platform.pc

EXTRA_DIST = autogen.sh *.sln *.xcodeproj

include common/build/doxygen.inc
include platform/build/platform.inc
