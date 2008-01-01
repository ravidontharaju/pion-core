# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

check_PROGRAMS = PionPlatformUnitTests
TESTS = $(check_PROGRAMS)

PionPlatformUnitTests_SOURCES = PionPlatformUnitTests.cpp VocabularyTests.cpp VocabularyConfigTests.cpp EventTests.cpp
PionPlatformUnitTests_LDADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @BOOST_TEST_LIB@ @PION_XML_LIB@
PionPlatformUnitTests_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj
