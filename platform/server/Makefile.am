# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

lib_LTLIBRARIES = libpion-server.la

libpion_server_la_SOURCES = PlatformService.hpp PlatformService.cpp \
	ServiceManager.hpp ServiceManager.cpp \
	PlatformConfig.hpp PlatformConfig.cpp \
	UserManager.hpp UserManager.cpp

libpion_server_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)
libpion_server_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
libpion_server_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

bin_PROGRAMS = pion

pion_SOURCES = main.cpp
pion_LDADD = libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
pion_DEPENDENCIES = libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj README.msvc
