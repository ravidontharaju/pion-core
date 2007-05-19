# -----------------------------------
# libpion automake configuration file 
# -----------------------------------

AM_CPPFLAGS = -I../include @LTDLINCL@

libpion_modulesdir = @PION_MODULES_DIRECTORY@
libpion_modules_LTLIBRARIES = HelloModule.la

HelloModule_la_SOURCES = HelloModule.cpp
HelloModule_la_LDFLAGS = -module -avoid-version
