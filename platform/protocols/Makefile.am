# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = HTTPProtocol.la

HTTPProtocol_la_CXXFLAGS = -shared $(AM_CXXFLAGS)
HTTPProtocol_la_SOURCES = HTTPProtocol.hpp HTTPProtocol.cpp
HTTPProtocol_la_LDFLAGS = -no-undefined -module -avoid-version
HTTPProtocol_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
HTTPProtocol_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj
