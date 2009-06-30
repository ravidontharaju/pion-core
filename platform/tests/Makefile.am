# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include @PION_TESTS_CPPFLAGS@

check_PROGRAMS = PionPlatformUnitTests
bin_PROGRAMS = PionPerformanceTests
TESTS = $(check_PROGRAMS)

PionPlatformUnitTests_SOURCES = PionPlatformUnitTests.cpp \
	CodecTests.cpp ComparisonTests.cpp ConfigManagerTests.cpp \
	ConfigServiceTests.cpp EventTests.cpp FeedServiceTests.cpp \
	PluginConfigTests.cpp ReactorTests.cpp \
	ServiceManagerTests.cpp UserManagerTests.cpp \
	VocabularyConfigTests.cpp VocabularyTests.cpp ProtocolTests.cpp \
	LogInputReactorTests.cpp TransformReactorTests.cpp \
	QueryServiceTests.cpp
PionPlatformUnitTests_LDADD = ../protocols/HTTPProtocol.la ../../sqlite/libpion-sqlite.la ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @BOOST_TEST_LIB@ @PION_PLATFORM_LIBS@
PionPlatformUnitTests_DEPENDENCIES = ../protocols/HTTPProtocol.la ../../sqlite/libpion-sqlite.la ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

PionPerformanceTests_SOURCES = PionPerformanceTests.cpp
PionPerformanceTests_LDADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @BOOST_TEST_LIB@ @PION_PLATFORM_LIBS@
PionPerformanceTests_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj config logs compressed-logs
