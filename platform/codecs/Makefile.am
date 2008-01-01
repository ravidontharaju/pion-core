# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = ELFCodec.la JSONCodec.la XMLCodec.la

ELFCodec_la_SOURCES = ELFCodec.hpp ELFCodec.cpp
ELFCodec_la_LDFLAGS = -no-undefined -module -avoid-version
ELFCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_XML_LIB@
ELFCodec_la_DEPENDENCIES = ../src/libpion-platform.la

JSONCodec_la_SOURCES = JSONCodec.hpp JSONCodec.cpp
JSONCodec_la_LDFLAGS = -no-undefined -module -avoid-version
JSONCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_XML_LIB@
JSONCodec_la_DEPENDENCIES = ../src/libpion-platform.la

XMLCodec_la_SOURCES = XMLCodec.hpp XMLCodec.cpp
XMLCodec_la_LDFLAGS = -no-undefined -module -avoid-version
XMLCodec_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_XML_LIB@
XMLCodec_la_DEPENDENCIES = ../src/libpion-platform.la

EXTRA_DIST = *.vcproj
