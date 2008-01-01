# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

bin_PROGRAMS = piond

piond_SOURCES = piond.cpp
piond_LDADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_XML_LIB@
piond_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj README.msvc
