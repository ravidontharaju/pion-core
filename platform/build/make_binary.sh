#!/bin/sh

LIB_DIRECTORY=/usr/local/lib
LIB_DIRECTORY_ALT=/usr/lib
PLUGIN_LIB_SUFFIX=so
if test "$2" = "osx"; then
	SHARED_LIB_SUFFIX=dylib
	BOOST_SUFFIX=*-mt-1_35.$SHARED_LIB_SUFFIX
	UUID_LIB=libuuid.16.$SHARED_LIB_SUFFIX
	LOG4CXX_LIB=liblog4cxx.$SHARED_LIB_SUFFIX
	SQLITE_LIB=libsqlite3.$SHARED_LIB_SUFFIX
	YAJL_LIB=libyajl.0.$SHARED_LIB_SUFFIX
else
	SHARED_LIB_SUFFIX=so
	BOOST_SUFFIX=*-mt-1_35.$SHARED_LIB_SUFFIX.1.35.0
	UUID_LIB=libuuid.$SHARED_LIB_SUFFIX.16
	LOG4CXX_LIB=liblog4cxx.$SHARED_LIB_SUFFIX.10
	SQLITE_LIB=libsqlite3.$SHARED_LIB_SUFFIX
	YAJL_LIB=libyajl.$SHARED_LIB_SUFFIX.0
fi

# Determine package name and binary output directory based on args
if test "x$1" != "x"; then
	PACKAGE_NAME=pion-platform-$1
else
	PACKAGE_NAME=pion-platform
fi
BIN_DIRECTORY=bin/$PACKAGE_NAME

# remove the old binary tree if it exists
echo "Removing old directory & files.."
rm -rf $BIN_DIRECTORY
rm -rf bin/$PACKAGE_NAME*

# create a new binary tree to copy files into
echo "Creating directory structure.."
mkdir -p $BIN_DIRECTORY
mkdir $BIN_DIRECTORY/config
mkdir $BIN_DIRECTORY/config/vocabularies
mkdir $BIN_DIRECTORY/plugins
mkdir $BIN_DIRECTORY/libs
mkdir $BIN_DIRECTORY/ui

# copy our third party library files into "libs"
echo "Copying binary files.."
cp $LIB_DIRECTORY/$UUID_LIB $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/$LOG4CXX_LIB $BIN_DIRECTORY/libs
if [ -e $LIB_DIRECTORY/$SQLITE_LIB ]; then
	cp $LIB_DIRECTORY/$SQLITE_LIB $BIN_DIRECTORY/libs
else
	cp $LIB_DIRECTORY_ALT/$SQLITE_LIB $BIN_DIRECTORY/libs
fi
cp $LIB_DIRECTORY/$YAJL_LIB $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_thread$BOOST_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_system$BOOST_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_filesystem$BOOST_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_regex$BOOST_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_date_time$BOOST_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_signals$BOOST_SUFFIX $BIN_DIRECTORY/libs

# copy the Pion shared library files into "libs"
cp common/src/.libs/libpion-common-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp net/src/.libs/libpion-net-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp platform/src/.libs/libpion-platform-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp platform/server/.libs/libpion-server-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs

# copy the Pion plugin files into "plugins"
cp net/services/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/codecs/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/protocols/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/databases/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/reactors/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/services/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins

# copy the server exe
cp platform/server/.libs/pion $BIN_DIRECTORY

# copy the user interface files into "ui"
(cd platform/ui; tar --exclude .svn -cf - *) | (cd $BIN_DIRECTORY/ui; tar xf -)

# copy the configuration files
(cd platform/config; tar --exclude .svn -cf - *) | (cd $BIN_DIRECTORY/config; tar xf -)

# copy other misc files
cp COPYING $BIN_DIRECTORY/LICENSE.txt
cp ChangeLog $BIN_DIRECTORY/HISTORY.txt
cp platform/build/README.bin $BIN_DIRECTORY/README.txt
cp platform/build/start_pion.sh $BIN_DIRECTORY

# create tarballs & zip file
echo "Creating binary tarballs.."
if test "x$2" != "x"; then
	TARBALL_NAME=$PACKAGE_NAME-$2
else
	TARBALL_NAME=$PACKAGE_NAME
fi
(cd bin; tar cfz $TARBALL_NAME.tar.gz $PACKAGE_NAME)
(cd bin; tar cfj $TARBALL_NAME.tar.bz2 $PACKAGE_NAME)
(cd bin; zip -qr9 $TARBALL_NAME.zip $PACKAGE_NAME)

if test "$2" = "osx"; then
	# Build application bundle for Mac OS X
	OSX_BIN_DIRECTORY=./bin/osx/$PACKAGE_NAME
	echo "Building Mac OS X application bundle.."
	rm -rf ./bin/osx
	mkdir -p ./bin/osx/$PACKAGE_NAME
	platypus -V $1 -a "Pion CEP Platform" -u "Atomic Labs, Inc." -t shell -o TextWindow -i platform/build/pion-icon.png -f $BIN_DIRECTORY/config -f $BIN_DIRECTORY/libs -f $BIN_DIRECTORY/pion -f $BIN_DIRECTORY/plugins -f $BIN_DIRECTORY/ui -I org.pion.Pion platform/build/start_osx.sh $OSX_BIN_DIRECTORY/Pion
	# Platypus' icon support is broken; copy file into .app package
	cp platform/build/appIcon.icns $OSX_BIN_DIRECTORY/Pion.app/Contents/Resources
	# Copy other misc files
	cp COPYING $OSX_BIN_DIRECTORY/LICENSE.txt
	cp ChangeLog $OSX_BIN_DIRECTORY/HISTORY.txt
	cp platform/build/README.bin.osx $OSX_BIN_DIRECTORY/README.txt
	(cd bin/osx; zip -qr9 $TARBALL_NAME-app.zip $PACKAGE_NAME)
	mv ./bin/osx/$TARBALL_NAME-app.zip ./bin/
fi
