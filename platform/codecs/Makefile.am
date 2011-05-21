# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

EXTRA_LTLIBRARIES = JSONCodec.la

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = LogCodec.la XMLCodec.la @PION_JSON_CODEC@

LogCodec_la_CXXFLAGS = -shared $(AM_CXXFLAGS)
LogCodec_la_SOURCES = LogCodec.hpp LogCodec.cpp
LogCodec_la_LDFLAGS = -no-undefined -module -avoid-version
LogCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
LogCodec_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

XMLCodec_la_CXXFLAGS = -shared $(AM_CXXFLAGS)
XMLCodec_la_SOURCES = XMLCodec.hpp XMLCodec.cpp
XMLCodec_la_LDFLAGS = -no-undefined -module -avoid-version
XMLCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
XMLCodec_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ 

JSONCodec_la_CXXFLAGS = -shared $(AM_CXXFLAGS)
JSONCodec_la_SOURCES = JSONCodec.hpp JSONCodec.cpp
JSONCodec_la_LDFLAGS = -no-undefined -module -avoid-version -rpath '@PION_PLUGINS_DIRECTORY@'
JSONCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@ @PION_JSON_LIB@
JSONCodec_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ 

EXTRA_DIST = *.vcproj
