# -----------------------------------
# libpion autoconf configuration file
# -----------------------------------

AC_INIT([libpion], [0.1.0], [support@atomiclabs.com])
AC_PREREQ([2.59])
AC_CONFIG_AUX_DIR(build)
AC_CONFIG_SRCDIR(src/lib/PionEngine.cpp)

# Note: AM_CONFIG_HEADER is deprecated
AC_CONFIG_HEADERS([src/include/libpion/PionConfig.hpp])

# DO NOT USE autoheader (the .hpp.in file is not automanaged)
AUTOHEADER="echo autoheader ignored"

# package and version args are now taken from AC_INIT()
AM_INIT_AUTOMAKE

# Define CXXFLAGS before AC_PROG_CXX to suppress the default autoconf
# compiler options
CXXFLAGS="-D_REENTRANT -Wall"

# Check for programs
AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_LIBTOOL

# Use C++ language for tests
AC_LANG_CPLUSPLUS

# Set Pion Version in PionConfig.hpp
AC_DEFINE_UNQUOTED([PION_VERSION],["$PACKAGE_VERSION"],[Define to the version number of libpion.])

# Debug setting
AC_ARG_WITH([debug],
    AC_HELP_STRING([--with-debug],[build with debugging information]),
    [with_debug=$withval],
    [with_debug=no])
if test "$with_debug" = "no"
then
	CXXFLAGS="$CXXFLAGS -O2 -DNDEBUG"
else
	AC_MSG_NOTICE(Building with debugging information)
	CXXFLAGS="$CXXFLAGS -ggdb -DDEBUG"
fi


# Check for unordered container support
AC_CHECK_HEADERS([unordered_map],[unordered_map_type=unordered_map],[])
AC_CHECK_HEADERS([ext/hash_map],[unordered_map_type=ext_hash_map],[])
AC_CHECK_HEADERS([hash_map],[unordered_map_type=hash_map],[])
if test "$unordered_map_type" = "unordered_map"; then
	AC_DEFINE([PION_HAVE_UNORDERED_MAP],[1],[Define to 1 if you have the <unordered_map> header file.])
elif test "$unordered_map_type" = "ext_hash_map"; then
	AC_DEFINE([PION_HAVE_EXT_HASH_MAP],[1],[Define to 1 if you have the <ext/hash_map> header file.])
elif test "$unordered_map_type" = "hash_map"; then
	AC_DEFINE([PION_HAVE_HASH_MAP],[1],[Define to 1 if you have the <hash_map> header file.])
else
	AC_MSG_ERROR([C++ compiler does not seem to support unordered containers])
fi


# Check for Boost
AX_BOOST_BASE([1.33])
AX_BOOST_THREAD
CPPFLAGS="$CPPFLAGS $BOOST_CPPFLAGS"
LDFLAGS="$LDFLAGS $BOOST_LDFLAGS $BOOST_THREAD_LIB"

# Check for Boost asio headers
AC_CHECK_HEADERS([boost/asio.hpp],,AC_MSG_ERROR(Unable to find the boost::asio headers))


# Check for log4cxx library
AC_ARG_WITH([log4cxx],
    AC_HELP_STRING([--with-log4cxx@<:@=DIR@:>@],[location of log4cxx library (enables logging)]),
    [ log4cxx_location=$withval ], [ without_log4cxx=true ])
if test "$without_log4cxx" = "true"
then
	AC_MSG_NOTICE([Logging is disabled (use --with-log4cxx) to enable])
else
	# Check if log4cxx location is specified
	if test "$log4cxx_location" != ""
	then
		CPPFLAGS="$CPPFLAGS -I$log4cxx_location/include"
		LDFLAGS="$LDFLAGS -L$log4cxx_location/lib"
	fi

	# Check for log4cxx headers
	AC_CHECK_HEADERS([log4cxx/logger.h],,AC_MSG_ERROR([Unable to find the log4cxx headers]))
	
	# Check for log4cxx library
	LDFLAGS="$LDFLAGS -llog4cxx"
	AC_TRY_LINK([#include <log4cxx/logger.h>],[ log4cxx::Logger::getRootLogger(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cxx works),
		AC_MSG_ERROR(Unable to link with the log4cxx library))

	# Found the log4cxx library
	AC_MSG_NOTICE(Using the log4cxx library for logging)
	AC_DEFINE([PION_HAVE_LOG4CXX],[1],[Define to 1 if you have the `log4cxx' library (-llog4cxx).])
fi


# Output Makefiles
AC_OUTPUT(Makefile src/Makefile src/include/Makefile \
	src/include/libpion/Makefile src/lib/Makefile src/modules/Makefile \
	src/tests/Makefile)
