# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

bin_PROGRAMS = pion

pion_SOURCES = main.cpp PlatformService.hpp PlatformService.cpp ServiceManager.hpp ServiceManager.cpp PlatformConfig.hpp PlatformConfig.cpp
pion_LDADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
pion_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj README.msvc
