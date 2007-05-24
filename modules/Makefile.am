# -----------------------------------
# libpion automake configuration file 
# -----------------------------------

AM_CPPFLAGS = -I../include @LTDLINCL@

libpion_modulesdir = @PION_MODULES_DIRECTORY@
libpion_modules_LTLIBRARIES = HelloModule.la EchoModule.la LogModule.la FileModule.la

HelloModule_la_SOURCES = HelloModule.hpp HelloModule.cpp
HelloModule_la_LDFLAGS = -module -avoid-version

EchoModule_la_SOURCES = EchoModule.hpp EchoModule.cpp
EchoModule_la_LDFLAGS = -module -avoid-version

LogModule_la_SOURCES = LogModule.hpp LogModule.cpp
LogModule_la_LDFLAGS = -module -avoid-version

FileModule_la_SOURCES = FileModule.hpp FileModule.cpp
FileModule_la_LDFLAGS = -module -avoid-version
FileModule_la_LIBADD = @BOOST_FILESYSTEM_LIB@
