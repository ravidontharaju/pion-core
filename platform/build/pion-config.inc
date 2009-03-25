# -----------------------------------------
# pion-platform autoconf configuration file
# -----------------------------------------

# Check for OSSP UUID library (REQUIRED)
AC_MSG_CHECKING([for OSSP UUID library (required)])
AC_ARG_WITH([uuid],
    AC_HELP_STRING([--with-uuid@<:@=DIR@:>@],[location of OSSP UUID library]),
    [ uuid_location=$withval ], [ without_uuid=true ])
# Check for uuid headers
if test "x$uuid_location" == "xyes"; then
	AC_MSG_RESULT(checking default locations)
	TRY_LOCATION="/usr/local /usr"
elif test "x$uuid_location" == "x"; then
	AC_MSG_RESULT(checking default locations)
	TRY_LOCATION="/usr/local /usr"
else
	AC_MSG_RESULT(checking $uuid_location)
	TRY_LOCATION="$uuid_location"
	LDFLAGS="$LDFLAGS -L$uuid_location/lib"
fi
AC_MSG_CHECKING(for OSSP UUID headers)
FOUND_UUID_HEADERS="false"
for uuid_location in $TRY_LOCATION ;
do
	if test -r "$uuid_location/include/uuid.h"; then
		CPPFLAGS="$CPPFLAGS -I$uuid_location/include"
		FOUND_UUID_HEADERS="true"
		break;
	fi
done
if test "$FOUND_UUID_HEADERS" == "true"; then
	AC_MSG_RESULT([found in $uuid_location])
else
	AC_MSG_RESULT(not found)
	AC_MSG_ERROR([Unable to find the OSSP UUID headers])
fi
# Check for uuid library
LIBS_SAVED="$LIBS"
LIBS="$LIBS_SAVED `$uuid_location/bin/uuid-config --all --libs`"
AC_MSG_CHECKING(linking with uuid)
AC_TRY_LINK([#include <uuid.h>],[ uuid_t *ptr; uuid_create(&ptr); return(0); ],
	[ AC_MSG_RESULT(ok) ],
	[ AC_MSG_RESULT(failed)
	  AC_MSG_ERROR(Unable to link with the OSSP UUID library)
	])
# Found the uuid library
LIBS="$LIBS_SAVED"
PION_UUID_LIB="-luuid"
AC_SUBST(PION_UUID_LIB)


# Check for libxml2 library (REQUIRED)
AC_MSG_CHECKING([for libxml library (required)])
AC_ARG_WITH([libxml],
    AC_HELP_STRING([--with-libxml@<:@=DIR@:>@],[location of libxml (v2) library]),
    [ xml_location=$withval ], [ without_xml=true ])
# Check for libxml2 headers
if test "x$xml_location" == "xyes"; then
	AC_MSG_RESULT(checking default locations)
	TRY_LOCATION="/usr/local /usr"
elif test "x$xml_location" == "x"; then
	AC_MSG_RESULT(checking default locations)
	TRY_LOCATION="/usr/local /usr"
else
	AC_MSG_RESULT(checking $xml_location)
	TRY_LOCATION="$xml_location"
	LDFLAGS="$LDFLAGS -L$xml_location/lib"
fi
AC_MSG_CHECKING(for libxml2 headers)
FOUND_XML_HEADERS="false"
for xml_location in $TRY_LOCATION ;
do
	if test -r "$xml_location/include/libxml2/libxml/tree.h"; then
		CPPFLAGS="$CPPFLAGS -I$xml_location/include/libxml2"
		FOUND_XML_HEADERS="true"
		break;
	elif test -r "$xml_location/include/libxml/tree.h"; then
		CPPFLAGS="$CPPFLAGS -I$xml_location/include"
		FOUND_XML_HEADERS="true"
		break;
	fi
done
if test "$FOUND_XML_HEADERS" == "true"; then
	AC_MSG_RESULT([found in $xml_location])
else
	AC_MSG_RESULT(not found)
	AC_MSG_ERROR([Unable to find the libxml2 headers])
fi
# Check for libxml2 library
LIBS_SAVED="$LIBS"
LIBS="$LIBS_SAVED -lxml2"
AC_MSG_CHECKING(linking with libxml2)
AC_TRY_LINK([#include <libxml/tree.h>],[ LIBXML_TEST_VERSION; return(0); ],
	[ AC_MSG_RESULT(ok) ],
	[ AC_MSG_RESULT(failed)
	  AC_MSG_ERROR(Unable to link with the libxml2 library)
	])
# Found the libxml2 library
LIBS="$LIBS_SAVED"
PION_XML_LIB="-lxml2"
AC_SUBST(PION_XML_LIB)


# Check for "Yet Another" JSON Library (YAJL)
AC_MSG_CHECKING([for JSON support (yajl)])
AC_ARG_WITH([yajl],
    AC_HELP_STRING([--with-yajl@<:@=DIR@:>@],[location of Yet Another JSON Library (YAJL)]),
    [ yajl_location=$withval ], [ without_yajl=true ])
if test "$without_yajl" != "true"; then
	AC_MSG_RESULT(yes)
	# Check for YAJL headers
	AC_MSG_CHECKING(for yajl headers)
	if test "x$yajl_location" != "xyes"; then
		CPPFLAGS="$CPPFLAGS -I$yajl_location/include"
		LDFLAGS="$LDFLAGS -L$yajl_location/lib"
	fi
	AC_CHECK_HEADERS([yajl/yajl_gen.h],,AC_MSG_ERROR([Unable to find the YAJL headers]))
	# Check for YAJL library
	LIBS_SAVED="$LIBS"
	LIBS="$LIBS_SAVED -lyajl"
	AC_MSG_CHECKING(linking with yajl)
	AC_TRY_LINK([#include <yajl/yajl_gen.h>],[ yajl_gen handle = yajl_gen_alloc(0); yajl_gen_free(handle); return(0); ],
		[ AC_MSG_RESULT(ok) ],
		[ AC_MSG_RESULT(failed)
		  AC_MSG_ERROR(Unable to link with the YAJL library)
		])
	LIBS="$LIBS_SAVED"
	PION_JSON_LIB="-lyajl"
	# Found the YAJL library
	PION_HAVE_JSON="-DPION_HAVE_JSON"
	PION_CODECS="LogCodec.la XMLCodec.la JSONCodec.la"
else
	# Display notice if YAJL is disabled
	AC_MSG_RESULT(no)
	PION_CODECS="LogCodec.la XMLCodec.la"
fi
AC_SUBST(PION_HAVE_JSON)
AC_SUBST(PION_JSON_LIB)

PION_DATABASES="SQLiteDatabase.la"
PION_PLATFORM_LIBS="$PION_XML_LIB $PION_UUID_LIB $PION_JSON_LIB"
AC_SUBST(PION_PLATFORM_LIBS)
AC_SUBST(PION_DATABASES)
AC_SUBST(PION_CODECS)
