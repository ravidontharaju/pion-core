# -----------------------------------
# libpion automake configuration file 
# -----------------------------------

AM_CPPFLAGS = -I../include

lib_LTLIBRARIES = libpion.la

libpion_la_SOURCES = PionPlugin.cpp PionEngine.cpp TCPServer.cpp \
	HTTPTypes.cpp HTTPResponse.cpp HTTPRequestParser.cpp HTTPServer.cpp

libpion_la_LIBADD = @LIBLTDL@
libpion_la_DEPENDENCIES = @LIBLTDL@
