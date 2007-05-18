# -----------------------------------
# libpion automake configuration file 
# -----------------------------------

AM_CPPFLAGS = -I../include

bin_PROGRAMS = PionServerTest PionModuleTest

PionServerTest_SOURCES = PionServerTest.cpp
PionServerTest_LDADD = ../src/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@
PionServerTest_DEPENDENCIES = ../src/libpion.la

PionModuleTest_SOURCES = PionModuleTest.cpp
PionModuleTest_LDADD = ../src/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@ @LIBLTDL@
PionModuleTest_DEPENDENCIES = ../src/libpion.la @LIBLTDL@
