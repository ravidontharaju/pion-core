# -----------------------------------
# libpion autoconf configuration file
# -----------------------------------

AC_INIT([libpion], [0.1.3], [support@atomiclabs.com])
AC_PREREQ([2.59])
AC_CONFIG_AUX_DIR(build)
AC_CONFIG_SRCDIR(src/lib/PionEngine.cpp)

# Note: AM_CONFIG_HEADER is deprecated
AC_CONFIG_HEADERS([src/include/libpion/PionConfig.hpp])

# DO NOT USE autoheader (the .hpp.in file is not automanaged)
AUTOHEADER="echo autoheader ignored"

# package and version args are now taken from AC_INIT()
AM_INIT_AUTOMAKE

# Set Pion Version in PionConfig.hpp
AC_DEFINE_UNQUOTED([PION_VERSION],["$PACKAGE_VERSION"],[Define to the version number of libpion.])

# Check for programs
AC_PROG_CXX
AC_PROG_INSTALL
AC_PROG_LIBTOOL

# Use C++ language
AC_LANG_CPLUSPLUS
AX_COMPILER_VENDOR

# Check for debug
AC_ARG_WITH([debug],
    AC_HELP_STRING([--with-debug],[build with debugging information]),
    [with_debug=$withval],
    [with_debug=no])

# Set compiler options
case "$ax_cv_cxx_compiler_vendor" in
sun)
	if test "$with_debug" = "no"; then
		CXXFLAGS="$CXXFLAGS -DNDEBUG -O2 -mt -library=stlport4"
		CPPFLAGS="$CPPFLAGS -DNDEBUG -mt -library=stlport4"
	else
		AC_MSG_NOTICE(Building with debugging information)
		CXXFLAGS="$CXXFLAGS -g -mt -library=stlport4"
		CPPFLAGS="$CPPFLAGS -mt -library=stlport4"
	fi
	;;
*)
	if test "$with_debug" = "no"; then
		CXXFLAGS="$CXXFLAGS -DNDEBUG -O2 -D_REENTRANT -Wall"
		CPPFLAGS="$CPPFLAGS -DNDEBUG -D_REENTRANT"
	else
		AC_MSG_NOTICE(Building with debugging information)
		CXXFLAGS="$CXXFLAGS -ggdb -D_REENTRANT -Wall"
	fi
	;;
esac


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
# Add socket library for Solaris (used by ASIO)
case "x$build_os" in
	*solaris*)
  	LDFLAGS="$LDFLAGS -lsocket"
	;;
esac

# Check for logging support
AC_ARG_WITH([log4cplus],
    AC_HELP_STRING([--with-log4cplus@<:@=DIR@:>@],[location of log4cplus library (enables logging)]),
    [ log4cplus_location=$withval ], [ without_log4cplus=true ])
AC_ARG_WITH([log4cxx],
    AC_HELP_STRING([--with-log4cxx@<:@=DIR@:>@],[location of log4cxx library (enables logging)]),
    [ log4cxx_location=$withval ], [ without_log4cxx=true ])
AC_ARG_WITH([log4cpp],
    AC_HELP_STRING([--with-log4cpp@<:@=DIR@:>@],[location of log4cpp library (enables logging)]),
    [ log4cpp_location=$withval ], [ without_log4cpp=true ])
AC_ARG_WITH([ostream-logging],
    AC_HELP_STRING([--with-ostream-logging],[use std::cout and std::cerr for logging]),
    [with_ostream_logging=true], [with_ostream_logging=false])

if test "$without_log4cplus" != "true"; then
	# Check if log4cplus location is specified
	if test "$log4cplus_location" != ""
	then
		CPPFLAGS="$CPPFLAGS -I$log4cplus_location/include"
		LDFLAGS="$LDFLAGS -L$log4cplus_location/lib"
	fi

	# Check for log4cplus headers
	AC_CHECK_HEADERS([log4cplus/logger.h],,AC_MSG_ERROR([Unable to find the log4cplus headers]))
	
	# Check for log4cplus library
	LDFLAGS="$LDFLAGS -llog4cplus"
	AC_TRY_LINK([#include <log4cplus/logger.h>],[ log4cplus::Logger::getRoot(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cplus works),
		AC_MSG_ERROR(Unable to link with the log4cplus library))

	# Found the log4cplus library
	AC_MSG_NOTICE(Using the log4cplus library for logging)
	AC_DEFINE([PION_HAVE_LOG4CPLUS],[1],[Define to 1 if you have the `log4cplus' library (-llog4cplus).])
elif test "$without_log4cxx" != "true"; then
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
elif test "$without_log4cpp" != "true"; then
	# Check if log4cpp location is specified
	if test "$log4cpp_location" != ""
	then
		CPPFLAGS="$CPPFLAGS -I$log4cpp_location/include"
		LDFLAGS="$LDFLAGS -L$log4cpp_location/lib"
	fi

	# Check for log4cpp headers
	AC_CHECK_HEADERS([log4cpp/Category.hh],,AC_MSG_ERROR([Unable to find the log4cpp headers]))
	
	# Check for log4cpp library
	LDFLAGS="$LDFLAGS -llog4cpp"
	AC_TRY_LINK([#include <log4cpp/Category.hh>],[ log4cpp::Category::getRoot(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cpp works),
		AC_MSG_ERROR(Unable to link with the log4cpp library))

	# Found the log4cpp library
	AC_MSG_NOTICE(Using the log4cpp library for logging)
	AC_DEFINE([PION_HAVE_LOG4CPP],[1],[Define to 1 if you have the `log4cpp' library (-llog4cpp).])
elif test "$with_ostream_logging" = "true"; then
	AC_MSG_NOTICE(Using std::cout and std::cerr for logging)
	AC_DEFINE([PION_HAVE_OSTREAM_LOGGING],[1],[Define to 1 to use std::cout and std::cerr for logging.])
else
	# Display notice if no logging found
	AC_MSG_NOTICE([Logging is disabled])
fi


# Output Makefiles
AC_OUTPUT(Makefile src/Makefile src/include/Makefile \
	src/include/libpion/Makefile src/lib/Makefile src/modules/Makefile \
	src/tests/Makefile)
