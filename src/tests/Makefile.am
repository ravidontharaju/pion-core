# -----------------------------------------------------
# libpion automake configuration file for src directory
# -----------------------------------------------------

AM_CPPFLAGS = -I../include

bin_PROGRAMS = PionProtocolTest PionModulesTest

PionProtocolTest_SOURCES = PionProtocolTest.cpp
PionProtocolTest_LDADD = ../lib/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@
PionProtocolTest_DEPENDENCIES = ../lib/libpion.la

PionModulesTest_SOURCES = PionModulesTest.cpp
PionModulesTest_LDADD = ../lib/libpion.la @BOOST_THREAD_LIB@ @PION_LOG_LIB@ @LIBLTDL@
PionModulesTest_DEPENDENCIES = ../lib/libpion.la @LIBLTDL@
