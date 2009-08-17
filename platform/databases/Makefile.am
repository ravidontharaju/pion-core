# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I../include

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = SQLiteDatabase.la

SQLiteDatabase_la_SOURCES = SQLiteDatabase.hpp SQLiteDatabase.cpp
SQLiteDatabase_la_CPPFLAGS = -I@PION_COMMON_HOME@/include -I../include
SQLiteDatabase_la_LDFLAGS = -no-undefined -module -avoid-version
SQLiteDatabase_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@ ../../sqlite/libpion-sqlite.la
SQLiteDatabase_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@ ../../sqlite/libpion-sqlite.la

EXTRA_DIST = *.vcproj
