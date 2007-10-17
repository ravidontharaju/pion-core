# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I@PION_REACTOR_HOME@/include -I../include

lib_LTLIBRARIES = libpion-platform.la

libpion_platform_la_SOURCES = ReactionEngine.cpp

libpion_platform_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)
libpion_platform_la_LIBADD = @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_REACTOR_LIB@ @BOOST_THREAD_LIB@ @BOOST_SYSTEM_LIB@ @BOOST_FILESYSTEM_LIB@ @PION_SSL_LIB@ @PION_APR_LIB@ @PION_LOG_LIB@
libpion_platform_la_DEPENDENCIES = @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_REACTOR_LIB@

EXTRA_DIST = *.vcproj
