#!/bin/sh

LIB_DIRECTORY=/usr/local/lib
PLUGIN_LIB_SUFFIX=so
SHARED_LIB_SUFFIX=dylib
BOOST_SUFFIX=-mt-1_34_1
UUID_LIB=libuuid.16
LOG4CXX_LIB=liblog4cxx.10

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
cp $LIB_DIRECTORY/$UUID_LIB.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/$LOG4CXX_LIB.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_thread$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_system$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_filesystem$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_regex$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_date_time$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp $LIB_DIRECTORY/libboost_signals$BOOST_SUFFIX.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs

# copy the Pion shared library files into "libs"
cp common/src/.libs/libpion-common-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp net/src/.libs/libpion-net-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp platform/src/.libs/libpion-platform-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs
cp platform/server/.libs/libpion-server-*.$SHARED_LIB_SUFFIX $BIN_DIRECTORY/libs

# copy the Pion plugin files into "plugins"
cp net/services/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
cp platform/codecs/.libs/*.$PLUGIN_LIB_SUFFIX $BIN_DIRECTORY/plugins
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
cp platform/build/start_pion.sh $BIN_DIRECTORY

# create tarballs & zip file
echo "Creating binary tarballs.."
(cd bin; tar cfz $PACKAGE_NAME.tar.gz $PACKAGE_NAME)
(cd bin; tar cfj $PACKAGE_NAME.tar.bz2 $PACKAGE_NAME)
(cd bin; zip -qr9 $PACKAGE_NAME.zip $PACKAGE_NAME)

if test "$2" == "osx"; then
	# Build application bundle for Mac OS X
	echo "Building Mac OS X application bundle.."
	rm -rf ./bin/Pion.app
	platypus -V "0.5.3" -a "Pion CEP Platform" -u "Atomic Labs, Inc." -t shell -o TextWindow -i platform/build/pion-icon.png -f $BIN_DIRECTORY/LICENSE.txt -f $BIN_DIRECTORY/config -f $BIN_DIRECTORY/libs -f $BIN_DIRECTORY/pion -f $BIN_DIRECTORY/plugins -f $BIN_DIRECTORY/ui -I org.pion.Pion platform/build/start_osx.sh ./bin/Pion
fi
