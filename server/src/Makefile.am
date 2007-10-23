# ---------------------------------------
# pion-server automake configuration file 
# ---------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I@PION_REACTOR_HOME@/include -I../../platform/include

bin_PROGRAMS = piond

piond_SOURCES = main.cpp
piond_LDADD = ../../platform/src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_REACTOR_LIB@ @PION_EXTERNAL_LIBS@
piond_DEPENDENCIES = ../../platform/src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_REACTOR_LIB@
