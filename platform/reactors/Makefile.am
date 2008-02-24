# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I../include

pion_pluginsdir = @PION_PLUGINS_DIRECTORY@
pion_plugins_LTLIBRARIES = FilterReactor.la TransformReactor.la \
	LogInputReactor.la LogOutputReactor.la SQLiteOutputReactor.la

FilterReactor_la_SOURCES = FilterReactor.hpp FilterReactor.cpp
FilterReactor_la_LDFLAGS = -no-undefined -module -avoid-version
FilterReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
FilterReactor_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@

TransformReactor_la_SOURCES = TransformReactor.hpp TransformReactor.cpp
TransformReactor_la_LDFLAGS = -no-undefined -module -avoid-version
TransformReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
TransformReactor_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@

LogInputReactor_la_SOURCES = LogInputReactor.hpp LogInputReactor.cpp
LogInputReactor_la_LDFLAGS = -no-undefined -module -avoid-version
LogInputReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
LogInputReactor_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@

LogOutputReactor_la_SOURCES = LogOutputReactor.hpp LogOutputReactor.cpp
LogOutputReactor_la_LDFLAGS = -no-undefined -module -avoid-version
LogOutputReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
LogOutputReactor_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@

SQLiteOutputReactor_la_SOURCES = SQLiteOutputReactor.hpp SQLiteOutputReactor.cpp
SQLiteOutputReactor_la_LDFLAGS = -no-undefined -module -avoid-version
SQLiteOutputReactor_la_LIBADD = ../src/libpion-platform.la @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
SQLiteOutputReactor_la_DEPENDENCIES = ../src/libpion-platform.la @PION_COMMON_LIB@

EXTRA_DIST = *.vcproj
