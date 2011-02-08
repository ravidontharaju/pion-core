# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

#AM_CFLAGS = -O2

lib_LTLIBRARIES = libpion-sqlite.la

libpion_sqlite_la_SOURCES = pion-sqlite.c pion-sqlite.h
libpion_sqlite_la_CFLAGS = -DSQLITE_THREADSAFE=2 -DSQLITE_TEMP_STORE=2 -DSQLITE_DEFAULT_AUTOVACUUM=0
libpion_sqlite_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)

bin_PROGRAMS = piondb

piondb_SOURCES = shell.c
piondb_CFLAGS = -DSQLITE_THREADSAFE=2 -DSQLITE_TEMP_STORE=2 -DSQLITE_DEFAULT_AUTOVACUUM=0
piondb_LDADD = libpion-sqlite.la -ldl
piondb_DEPENDENCIES = libpion-sqlite.la

EXTRA_DIST = *.vcproj
