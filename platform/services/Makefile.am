# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include -I../server

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = ConfigService.la

ConfigService_la_SOURCES = ConfigService.hpp ConfigService.cpp
ConfigService_la_LDFLAGS = -no-undefined -module -avoid-version
ConfigService_la_LIBADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
ConfigService_la_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj
