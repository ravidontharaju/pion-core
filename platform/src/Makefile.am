# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

AM_CPPFLAGS = -I@PION_COMMON_HOME@/include -I../include

lib_LTLIBRARIES = libpion-platform.la

libpion_platform_la_SOURCES = Event.cpp Vocabulary.cpp VocabularyConfig.cpp \
	CodecFactory.cpp ConfigManager.cpp DatabaseManager.cpp \
	VocabularyManager.cpp ReactionEngine.cpp PlatformPlugin.cpp \
	Codec.cpp Database.cpp Reactor.cpp Comparison.cpp \
	Transform.cpp Protocol.cpp ProtocolFactory.cpp

libpion_platform_la_LDFLAGS = -no-undefined -release $(PION_LIBRARY_VERSION)
libpion_platform_la_LIBADD = @PION_COMMON_LIB@ @PION_EXTERNAL_LIBS@ @PION_PLATFORM_LIBS@
libpion_platform_la_DEPENDENCIES = @PION_COMMON_LIB@

EXTRA_DIST = *.vcproj
