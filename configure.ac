# -----------------------------------------
# Pion Platform autoconf configuration file
# -----------------------------------------

# Set Pion version information
AC_INIT([pion-platform], [0.5.5], [support@atomiclabs.com])

# Initialize some other things
AC_PREREQ([2.59])
AC_CONFIG_AUX_DIR(platform/build)
AC_CONFIG_SRCDIR(platform/src/Vocabulary.cpp)

# package and version args are now taken from AC_INIT()
AM_INIT_AUTOMAKE

# Setup libtool
AC_LIBTOOL_WIN32_DLL
AC_LIBTOOL_DLOPEN
AC_PROG_LIBTOOL

# Define CXXFLAGS before AC_PROG_CXX to suppress the default autoconf
# compiler options
CXXFLAGS="-DPION_PLATFORM"

# Currently only the embedded common library can be used
PION_COMMON_HOME=`pwd`/common
PION_COMMON_LIB="$PION_COMMON_HOME/src/libpion-common.la"
PION_COMMON_MAKEDIRS=common
AC_SUBST(PION_COMMON_HOME)
AC_SUBST(PION_COMMON_LIB)
AC_SUBST(PION_COMMON_MAKEDIRS)
AC_MSG_NOTICE([Using the embedded pion-common library])

# Currently only the embedded net library can be used
PION_NET_HOME=`pwd`/net
PION_NET_LIB="$PION_NET_HOME/src/libpion-net.la"
PION_NET_MAKEDIRS=net
AC_SUBST(PION_NET_HOME)
AC_SUBST(PION_NET_LIB)
AC_SUBST(PION_NET_MAKEDIRS)
AC_MSG_NOTICE([Using the embedded pion-net library])

# Include pion-config.m4
m4_include([common/build/pion-config.inc])
m4_include([platform/build/pion-config.inc])

# Output Makefiles
AC_OUTPUT(pion-platform.pc Makefile
	common/Makefile common/include/Makefile common/include/pion/Makefile
	common/src/Makefile common/tests/Makefile common/tests/PluginsUsedByUnitTests/Makefile
	net/Makefile net/include/Makefile net/include/pion/Makefile net/include/pion/net/Makefile
	net/src/Makefile net/services/Makefile net/utils/Makefile net/tests/Makefile
	platform/Makefile platform/include/Makefile
	platform/include/pion/Makefile platform/include/pion/platform/Makefile
	platform/src/Makefile platform/server/Makefile platform/tests/Makefile
	platform/codecs/Makefile platform/reactors/Makefile
	platform/databases/Makefile platform/services/Makefile)
