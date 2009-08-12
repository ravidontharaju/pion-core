# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

ACLOCAL_AMFLAGS = -I common/build -I platform/build

SUBDIRS = sqlite @PION_COMMON_MAKEDIRS@ @PION_NET_MAKEDIRS@ platform

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-platform.pc

EXTRA_DIST = autogen.sh *.sln *.aip.tmpl *.xcodeproj winutils

include common/build/doxygen.inc
include platform/build/platform.inc

all-local: docs

clean-local: clean-docs
