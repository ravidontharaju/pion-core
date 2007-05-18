# -----------------------------------------------------
# libpion automake configuration file for src directory
# -----------------------------------------------------

AM_CPPFLAGS = -I../include

bin_PROGRAMS = PionServerTest PionModuleTest

PionServerTest_SOURCES = PionServerTest.cpp
PionServerTest_LDADD = ../lib/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@
PionServerTest_DEPENDENCIES = ../lib/libpion.la

PionModuleTest_SOURCES = PionModuleTest.cpp
PionModuleTest_LDADD = ../lib/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@ @LIBLTDL@
PionModuleTest_DEPENDENCIES = ../lib/libpion.la @LIBLTDL@
