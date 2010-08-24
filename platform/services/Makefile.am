# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include -I../server

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = ConfigService.la FeedService.la MonitorService.la QueryService.la

ConfigService_la_SOURCES = ConfigService.hpp ConfigService.cpp
ConfigService_la_LDFLAGS = -no-undefined -module -avoid-version
ConfigService_la_LIBADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
ConfigService_la_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

FeedService_la_SOURCES = FeedService.hpp FeedService.cpp
FeedService_la_LDFLAGS = -no-undefined -module -avoid-version
FeedService_la_LIBADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
FeedService_la_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

MonitorService_la_SOURCES = MonitorService.hpp MonitorService.cpp
MonitorService_la_LDFLAGS = -no-undefined -module -avoid-version
MonitorService_la_LIBADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
MonitorService_la_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

QueryService_la_SOURCES = QueryService.hpp QueryService.cpp
QueryService_la_LDFLAGS = -no-undefined -module -avoid-version
QueryService_la_LIBADD = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
QueryService_la_DEPENDENCIES = ../server/libpion-server.la ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj
