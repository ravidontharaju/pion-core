# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I@PION_NET_HOME@/include -I../include

lib_LTLIBRARIES = libpion-platform.la

libpion_platform_la_SOURCES = Event.cpp Vocabulary.cpp VocabularyConfig.cpp \
	CodecFactory.cpp ConfigManager.cpp DatabaseManager.cpp \
	ReactionEngine.cpp Codec.cpp Database.cpp Reactor.cpp

libpion_platform_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)
libpion_platform_la_LIBADD = @PION_COMMON_LIB@ @PION_NET_LIB@ @PION_EXTERNAL_LIBS@ @PION_XML_LIB@
libpion_platform_la_DEPENDENCIES = @PION_COMMON_LIB@ @PION_NET_LIB@

EXTRA_DIST = *.vcproj
