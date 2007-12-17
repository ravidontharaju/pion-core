# -----------------------------------------------
# Pion Common Library autoconf configuration file
# -----------------------------------------------

# Set Pion version information
AC_INIT([pion-common], [0.5.3], [support@atomiclabs.com])

# Initialize some other things
AC_PREREQ([2.59])
AC_CONFIG_AUX_DIR(common/build)
AC_CONFIG_SRCDIR(common/src/PionPlugin.cpp)

# package and version args are now taken from AC_INIT()
AM_INIT_AUTOMAKE

# Setup libtool
AC_LIBTOOL_WIN32_DLL
AC_LIBTOOL_DLOPEN
AC_PROG_LIBTOOL

# Define CXXFLAGS before AC_PROG_CXX to suppress the default autoconf
# compiler options
CXXFLAGS="-DPION_COMMON_LIBRARY"

# Include pion-config.m4
m4_include([common/build/pion-config.inc])

# Output Makefiles
AC_OUTPUT(pion-common.pc Makefile common/Makefile
	common/include/Makefile common/include/pion/Makefile common/src/Makefile 
	common/tests/Makefile common/tests/PluginsUsedByUnitTests/Makefile)
