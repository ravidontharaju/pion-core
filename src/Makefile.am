# ------------------------------------
# pion-net automake configuration file 
# ------------------------------------

AM_CPPFLAGS = -I../include

lib_LTLIBRARIES = libpion-net.la

libpion_net_la_SOURCES = PionEngine.cpp TCPServer.cpp \
	HTTPTypes.cpp HTTPResponse.cpp HTTPRequestParser.cpp HTTPServer.cpp

libpion_net_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)
libpion_net_la_LIBADD = @PION_COMMON_LIB@ @BOOST_THREAD_LIB@ @BOOST_SYSTEM_LIB@ @BOOST_FILESYSTEM_LIB@ @PION_SSL_LIB@ @PION_LOG_LIB@
