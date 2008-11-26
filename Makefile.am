# ---------------------------------------
# pion-common automake configuration file 
# ---------------------------------------

ACLOCAL_AMFLAGS = -I common/build

SUBDIRS = common

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-common.pc

EXTRA_DIST = autogen.sh *.sln *.xcodeproj

include common/build/doxygen.inc
include common/build/common.inc

all-local: docs

clean-local: clean-docs
