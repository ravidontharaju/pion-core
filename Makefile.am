# ------------------------------------
# pion-net automake configuration file 
# ------------------------------------

ACLOCAL_AMFLAGS = -I common/build

SUBDIRS = @PION_COMMON_MAKEDIRS@ include src services utils @PION_TESTS_MAKEDIRS@

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-net.pc

EXTRA_DIST = autogen.sh *.sln *.xcodeproj doc build/*.vsprops *.vcproj

include common/build/doxygen.inc
include build/net.inc
