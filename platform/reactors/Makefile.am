# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = FilterReactor.la

FilterReactor_la_SOURCES = FilterReactor.hpp FilterReactor.cpp
FilterReactor_la_LDFLAGS = -no-undefined -module -avoid-version
FilterReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
FilterReactor_la_DEPENDENCIES = ../src/libpion-platform.la

EXTRA_DIST = *.vcproj
