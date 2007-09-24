# ------------------------------------------------
# Pion Network Library autoconf configuration file
# ------------------------------------------------

# Set Pion version information
AC_INIT([pion-net], [0.3.3], [support@atomiclabs.com])
PION_LIBRARY_VERSION=$PACKAGE_VERSION
AC_SUBST(PION_LIBRARY_VERSION)
AC_DEFINE_UNQUOTED([PION_VERSION],["$PACKAGE_VERSION"],[Define to the version number of pion-net.])

# Initialize some other things
AC_PREREQ([2.59])
AC_CONFIG_AUX_DIR(build)
AC_CONFIG_SRCDIR(src/PionEngine.cpp)

# Note: AM_CONFIG_HEADER is deprecated
#AC_CONFIG_HEADERS([include/pion/net/PionEngine.hpp])

# DO NOT USE autoheader (the .hpp.in file is not automanaged)
AUTOHEADER="echo autoheader ignored"

# package and version args are now taken from AC_INIT()
AM_INIT_AUTOMAKE

# Define CXXFLAGS before AC_PROG_CXX to suppress the default autoconf
# compiler options
CXXFLAGS="-DPION_NETWORK_LIBRARY"

# Setup libtool
AC_LIBTOOL_WIN32_DLL
AC_LIBTOOL_DLOPEN
AC_PROG_LIBTOOL

# Check for programs
AC_PROG_CXX
AC_PROG_INSTALL

# Use C++ language
AC_LANG_CPLUSPLUS
AX_COMPILER_VENDOR

# Set basic compiler options
case "$build_os" in
*solaris*)
	if test "$ax_cv_cxx_compiler_vendor" = "sun"; then
		# Solaris: Sun Studio C++ compiler
		CPPFLAGS="$CPPFLAGS -mt -library=stlport4"
		LDFLAGS="$LDFLAGS -mt -library=stlport4"
		PION_OPT_FLAGS="-O2"
		PION_DEBUG_FLAGS="-g"
	else
		# Solaris: GCC compiler
		CPPFLAGS="$CPPFLAGS -pthreads -D_REENTRANT"
		LDFLAGS="$LDFLAGS -pthreads"
		PION_OPT_FLAGS="-O2 -Wall"
		PION_DEBUG_FLAGS="-ggdb -Wall -fno-inline"
	fi
	LIBS="$LIBS -lsocket -lnsl -ldl -lposix4"
	;;
*darwin*)
	# Mac OS X: GCC compiler
	# -pthread is implied (automatically set by compiler)
	CPPFLAGS="$CPPFLAGS -D_REENTRANT"
	#LDFLAGS="$LDFLAGS"
	PION_OPT_FLAGS="-O2 -Wall"
	PION_DEBUG_FLAGS="-ggdb -Wall -fno-inline"
	LIBS="$LIBS -ldl"
	;;
*cygwin*)
	# Cygwin GCC compiler (Windows)
	CPPFLAGS="$CPPFLAGS -mthreads -D_REENTRANT -DPION_WIN32 -D__USE_W32_SOCKETS"
	LDFLAGS="$LDFLAGS -mthreads"
	PION_OPT_FLAGS="-O2 -Wall"
	PION_DEBUG_FLAGS="-ggdb -Wall -fno-inline"
	LIBS="$LIBS -lws2_32 -lmswsock"
	;;
*freebsd*)
	# FreeBSD: GCC compiler
	CPPFLAGS="$CPPFLAGS -pthread -D_REENTRANT"
	LDFLAGS="$LDFLAGS -pthread"
	PION_OPT_FLAGS="-O2 -Wall"
	PION_DEBUG_FLAGS="-ggdb -Wall -fno-inline"
	;;
*)
	# Other (Linux): GCC compiler
	CPPFLAGS="$CPPFLAGS -pthread -D_REENTRANT"
	LDFLAGS="$LDFLAGS -pthread"
	PION_OPT_FLAGS="-O2 -Wall"
	PION_DEBUG_FLAGS="-ggdb -Wall -fno-inline"
	LIBS="$LIBS -ldl"
	;;
esac


# Check for debug
AC_ARG_WITH([debug],
    AC_HELP_STRING([--with-debug],[build with debugging information]),
    [with_debug=$withval],
    [with_debug=no])
if test "$with_debug" = "no"; then
	CXXFLAGS="$CXXFLAGS $PION_OPT_FLAGS"
else
	AC_MSG_NOTICE(Building with debugging information)
	CXXFLAGS="$CXXFLAGS $PION_DEBUG_FLAGS"
fi


# Check for --with-plugins
AC_ARG_WITH([plugins],
    AC_HELP_STRING([--with-plugins@<:@=DIR@:>@],[directory where Pion Plug-ins are installed]),
    [with_plugins=$withval],
    [with_plugins=no])
if test "$with_plugins" = "no"; then
	if test "x$prefix" = "xNONE"; then
		PION_PLUGINS_DIRECTORY=/usr/local/lib/pion/plugins
	else
		PION_PLUGINS_DIRECTORY=${prefix}/lib/pion/plugins
	fi
else
	PION_PLUGINS_DIRECTORY=$with_plugins
fi
AC_MSG_NOTICE([Pion Plug-ins directory: $PION_PLUGINS_DIRECTORY])
AC_DEFINE_UNQUOTED([PION_PLUGINS_DIRECTORY],["$PION_PLUGINS_DIRECTORY"],[Define to the directory where Pion Plug-ins are installed.])
AC_SUBST(PION_PLUGINS_DIRECTORY)


# Check for Boost
AX_BOOST_BASE([1.34])
CPPFLAGS="$CPPFLAGS $BOOST_CPPFLAGS"
LDFLAGS="$LDFLAGS $BOOST_LDFLAGS"


# Check for pion-common library
AC_ARG_WITH([common],
    AC_HELP_STRING([--with-common@<:@=DIR@:>@],[location of pion-common library: required]),
    [ pion_common_location=$withval ], [ find_common_location=true ])
# Check if common location is specified
if test "$find_common_location" == "true"; then
	# No location was specified; try to find it
	CPPFLAGS_SAVED="$CPPFLAGS"
	for pion_common_test in $prefix /usr/local ../pion-common
	do
		CPPFLAGS="$CPPFLAGS_SAVED -I${pion_common_test}/include"
		AC_CHECK_HEADERS([pion/PionException.hpp],
			[pion_common_location="${pion_common_test}"; break],
			[pion_common_location=""])
	done	
	if test "x$pion_common_location" = "x"; then
		AC_MSG_ERROR(Unable to find the pion-common library: use --with-common)
	fi
	AC_MSG_NOTICE(Found pion-common library in $pion_common_location)
	# Use the location we found
	CPPFLAGS="$CPPFLAGS_SAVED -I$pion_common_location/include"
else
	# Check for pion-common library headers
	CPPFLAGS="$CPPFLAGS -I$pion_common_location/include"
	AC_CHECK_HEADERS([pion/PionException.hpp],,AC_MSG_ERROR([Unable to find the pion-common headers in ${pion_common_location}]))
fi
# Check for PionConfig.hpp header
AC_CHECK_HEADERS([pion/PionConfig.hpp],,
	AC_MSG_ERROR([Found pion-common library but it has not been configured]))
# Check for pion-common library
for pion_common_test in $pion_common_location/lib $pion_common_location/src
do
	if test -f "$pion_common_test/libpion-common.la"; then
		PION_COMMON_LIB="$pion_common_test/libpion-common.la"
		break
	else
		PION_COMMON_LIB=""
	fi
done
LIBS="$LIBS_SAVED"
if test "x$PION_COMMON_LIB" = "x"; then
	AC_MSG_ERROR(Unable to find libtool file for the pion-common library)
fi
AC_MSG_NOTICE([Using pion-common library in $pion_common_location])
AC_SUBST(PION_COMMON_LIB)


# Check for Boost ASIO library
AC_CHECK_HEADERS([boost/asio.hpp],,AC_MSG_ERROR(Unable to find the boost::asio headers))


# Check for Boost Thread library
AC_CHECK_HEADERS([boost/thread/thread.hpp],,AC_MSG_ERROR(Unable to find the boost::thread headers))
LIBS_SAVED="$LIBS"
BOOST_LIB=boost_thread
for ax_lib in $BOOST_LIB-$CC-mt $BOOST_LIB-mt lib$BOOST_LIB-$CC-mt \
	lib$BOOST_LIB-mt $BOOST_LIB-$CC $BOOST_LIB lib$BOOST_LIB-$CC \
	lib$BOOST_LIB \
	$BOOST_LIB-${CC}34-mt lib$BOOST_LIB-${CC}34-mt \
	$BOOST_LIB-${CC}34 lib$BOOST_LIB-${CC}34 \
	$BOOST_LIB-${CC}41-mt lib$BOOST_LIB-${CC}41-mt \
	$BOOST_LIB-${CC}41 lib$BOOST_LIB-${CC}41;
do
	LIBS="$LIBS_SAVED -l$ax_lib"
	AC_MSG_NOTICE(Checking for -l$ax_lib)
	AC_TRY_LINK([#include <boost/thread/thread.hpp>],
		[ boost::thread current_thread; return 0; ],
		[BOOST_THREAD_LIB="-l$ax_lib"; break],
		[BOOST_THREAD_LIB=""])
done
if test "x$BOOST_THREAD_LIB" = "x"; then
	AC_MSG_ERROR(Unable to link with the boost::thread library)
else
	AC_MSG_NOTICE(Linking with boost::thread works)
fi
LIBS="$LIBS_SAVED"
AC_SUBST(BOOST_THREAD_LIB)


# Check for Boost System library
AC_CHECK_HEADERS([boost/system/error_code.hpp],,AC_MSG_ERROR(Unable to find the boost::system headers))
LIBS_SAVED="$LIBS"
BOOST_LIB=boost_system
for ax_lib in $BOOST_LIB-$CC-mt $BOOST_LIB-mt lib$BOOST_LIB-$CC-mt \
	lib$BOOST_LIB-mt $BOOST_LIB-$CC $BOOST_LIB lib$BOOST_LIB-$CC \
	lib$BOOST_LIB \
	$BOOST_LIB-${CC}34-mt lib$BOOST_LIB-${CC}34-mt \
	$BOOST_LIB-${CC}34 lib$BOOST_LIB-${CC}34 \
	$BOOST_LIB-${CC}41-mt lib$BOOST_LIB-${CC}41-mt \
	$BOOST_LIB-${CC}41 lib$BOOST_LIB-${CC}41;
do
	LIBS="$LIBS_SAVED -l$ax_lib"
	AC_MSG_NOTICE(Checking for -l$ax_lib)
	AC_TRY_LINK([#include <boost/system/error_code.hpp>],
		[ boost::system::error_code error_code; std::string message(error_code.message()); return 0; ],
		[BOOST_SYSTEM_LIB="-l$ax_lib"; break],
		[BOOST_SYSTEM_LIB=""])
done
if test "x$BOOST_SYSTEM_LIB" = "x"; then
	AC_MSG_ERROR(Unable to link with the boost::system library)
else
	AC_MSG_NOTICE(Linking with boost::system works)
fi
LIBS="$LIBS_SAVED"
AC_SUBST(BOOST_SYSTEM_LIB)


# Check for Boost Filesystem library
AC_CHECK_HEADERS([boost/filesystem/path.hpp],,AC_MSG_ERROR(Unable to find the boost::filesystem headers))
LIBS_SAVED="$LIBS"
BOOST_LIB=boost_filesystem
for ax_lib in $BOOST_LIB-$CC-mt $BOOST_LIB-mt lib$BOOST_LIB-$CC-mt \
	lib$BOOST_LIB-mt $BOOST_LIB-$CC $BOOST_LIB lib$BOOST_LIB-$CC \
	lib$BOOST_LIB \
	$BOOST_LIB-${CC}34-mt lib$BOOST_LIB-${CC}34-mt \
	$BOOST_LIB-${CC}34 lib$BOOST_LIB-${CC}34 \
	$BOOST_LIB-${CC}41-mt lib$BOOST_LIB-${CC}41-mt \
	$BOOST_LIB-${CC}41 lib$BOOST_LIB-${CC}41;
do
	LIBS="$LIBS_SAVED -l$ax_lib"
	AC_MSG_NOTICE(Checking for -l$ax_lib)
	AC_TRY_LINK([#include <boost/filesystem/path.hpp>],
		[ boost::filesystem::path a_path; return 0; ],
		[BOOST_FILESYSTEM_LIB="-l$ax_lib"; break],
		[BOOST_FILESYSTEM_LIB=""])
done
if test "x$BOOST_FILESYSTEM_LIB" = "x"; then
	AC_MSG_ERROR(Unable to link with the boost::filesystem library)
else
	AC_MSG_NOTICE(Linking with boost::filesystem works)
fi
LIBS="$LIBS_SAVED"
AC_SUBST(BOOST_FILESYSTEM_LIB)


# Check for OpenSSL
AC_ARG_WITH([openssl],
    AC_HELP_STRING([--with-openssl@<:@=DIR@:>@],[location of OpenSSL library (enables SSL support)]),
    [ openssl_location=$withval ], [ without_openssl=true ])
# Check if openssl location is specified
if test "$without_openssl" != "true"; then
	if test "x$openssl_location" != "xyes"; then
		CPPFLAGS="$CPPFLAGS -I$openssl_location/include"
		LDFLAGS="$LDFLAGS -L$openssl_location/lib"
	fi
	# Check for OpenSSL headers
	AC_CHECK_HEADERS([openssl/ssl.h],,AC_MSG_ERROR([Unable to find the OpenSSL headers]))
	# Check for openssl library
	LIBS_SAVED="$LIBS"
	LIBS="$LIBS_SAVED -lssl -lcrypto"
	AC_TRY_LINK([#include <openssl/ssl.h>],[ SSL_library_init(); return(0); ],
		AC_MSG_NOTICE(Linking with OpenSSL works),
		AC_MSG_ERROR(Unable to link with the OpenSSL library))
	LIBS="$LIBS_SAVED"
	PION_SSL_LIB="-lssl -lcrypto"
	# Found the OpenSSL library
	AC_MSG_NOTICE(SSL encryption support enabled (found OpenSSL))
	AC_DEFINE([PION_HAVE_SSL],[1],[Define to 1 if you have the `OpenSSL' library.])
else
	# Display notice if SSL is disabled
	AC_MSG_NOTICE([SSL support is disabled (try --with-openssl)])
fi
AC_SUBST(PION_SSL_LIB)


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
	if test "x$log4cplus_location" != "xyes"
	then
		CPPFLAGS="$CPPFLAGS -I$log4cplus_location/include"
		LDFLAGS="$LDFLAGS -L$log4cplus_location/lib"
	fi

	# Check for log4cplus headers
	AC_CHECK_HEADERS([log4cplus/logger.h],,AC_MSG_ERROR([Unable to find the log4cplus headers]))
	
	# Check for log4cplus library
	LIBS_SAVED="$LIBS"
	LIBS="$LIBS_SAVED -llog4cplus"
	AC_TRY_LINK([#include <log4cplus/logger.h>],[ log4cplus::Logger::getRoot(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cplus works),
		AC_MSG_ERROR(Unable to link with the log4cplus library))
	LIBS="$LIBS_SAVED"
	PION_LOG_LIB="-llog4cplus"

	# Found the log4cplus library
	AC_MSG_NOTICE(Using the log4cplus library for logging)
	AC_DEFINE([PION_HAVE_LOG4CPLUS],[1],[Define to 1 if you have the `log4cplus' library (-llog4cplus).])
elif test "$without_log4cxx" != "true"; then
	# Check if log4cxx location is specified
	if test "x$log4cxx_location" != "xyes"
	then
		CPPFLAGS="$CPPFLAGS -I$log4cxx_location/include"
		LDFLAGS="$LDFLAGS -L$log4cxx_location/lib"
	fi

	# Check for log4cxx headers
	AC_CHECK_HEADERS([log4cxx/logger.h],,AC_MSG_ERROR([Unable to find the log4cxx headers]))
	
	# Check for log4cxx library
	LIBS_SAVED="$LIBS"
	LIBS="$LIBS_SAVED -llog4cxx"
	AC_TRY_LINK([#include <log4cxx/logger.h>],[ log4cxx::Logger::getRootLogger(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cxx works),
		AC_MSG_ERROR(Unable to link with the log4cxx library))
	LIBS="$LIBS_SAVED"
	PION_LOG_LIB="-llog4cxx"

	# Found the log4cxx library
	AC_MSG_NOTICE(Using the log4cxx library for logging)
	AC_DEFINE([PION_HAVE_LOG4CXX],[1],[Define to 1 if you have the `log4cxx' library (-llog4cxx).])
elif test "$without_log4cpp" != "true"; then
	# Check if log4cpp location is specified
	if test "x$log4cpp_location" != "xyes"
	then
		CPPFLAGS="$CPPFLAGS -I$log4cpp_location/include"
		LDFLAGS="$LDFLAGS -L$log4cpp_location/lib"
	fi

	# Check for log4cpp headers
	AC_CHECK_HEADERS([log4cpp/Category.hh],,AC_MSG_ERROR([Unable to find the log4cpp headers]))
	
	# Check for log4cpp library
	LIBS_SAVED="$LIBS"
	LIBS="$LIBS_SAVED -llog4cpp"
	AC_TRY_LINK([#include <log4cpp/Category.hh>],[ log4cpp::Category::getRoot(); return 0; ],
		AC_MSG_NOTICE(Linking with log4cpp works),
		AC_MSG_ERROR(Unable to link with the log4cpp library))
	LIBS="$LIBS_SAVED"
	PION_LOG_LIB="-llog4cpp"

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
AC_SUBST(PION_LOG_LIB)


# Output Makefiles
AC_OUTPUT(pion-net.pc Makefile include/Makefile include/pion/Makefile
	include/pion/net/Makefile src/Makefile modules/Makefile tests/Makefile)
