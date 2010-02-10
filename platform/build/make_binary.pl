#!/usr/bin/perl
# ------------------------------------------
# pion-core binary distribution build script
# ------------------------------------------

use File::Spec;
use File::Path;
use File::Copy;
use File::Glob ':glob';

# include perl source with common subroutines
require File::Spec->catfile( ("common", "build"), "common.pl");


# -----------------------------------
# process argv & set global variables
# -----------------------------------

# check command line parameters
die("usage: make_binary.pl <VERSION> <PLATFORM> [nozip]") if ($#ARGV < 1);

# set some global variables
$VERSION = $ARGV[0];
$PLATFORM = $ARGV[1];
$NOZIP = $ARGV[2];
$BIN_DIR = "bin";
$PACKAGE_NAME = "pion-core-" . $VERSION;
$PACKAGE_DIR = File::Spec->catdir( ($BIN_DIR, $PACKAGE_NAME) );
$TARBALL_NAME = $PACKAGE_NAME . "-" . $PLATFORM;
$CONFIG_DIR = File::Spec->catdir( ($PACKAGE_DIR, "config") );
$PLUGINS_DIR = File::Spec->catdir( ($PACKAGE_DIR, "plugins") );
$LIBS_DIR = ($PLATFORM =~ /^win32/i) ? $PACKAGE_DIR : File::Spec->catdir( ($PACKAGE_DIR, "libs") );
$UI_DIR = File::Spec->catdir( ($PACKAGE_DIR, "ui") );
$BOOST_LIB_GLOB = "{thread,system,filesystem,regex,date_time,signals,iostreams}";
$DLL_FULL_DIR = "release_dll_full";

# platform-specific variables
if ($PLATFORM =~ /^win32/i) {
	$SHARED_LIB_SUFFIX = "dll";
	$PLUGIN_LIB_SUFFIX = "dll";
	$SYSTEM_LIB_DIR = $ENV{"PION_LIBS"} || File::Spec->rootdir();
	$LOGGING_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "log4cplus-1.0.3", "bin"), "log4cplus." . $SHARED_LIB_SUFFIX);
	$YAJL_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "yajl-1.0.5", "bin"), "yajl." . $SHARED_LIB_SUFFIX);
	$ICONV_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "iconv-1.9.2", "bin"), "iconv." . $SHARED_LIB_SUFFIX);
	$LIBXML_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "libxml2-2.6.30", "bin"), "libxml2." . $SHARED_LIB_SUFFIX);
	$ZLIB_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "zlib-1.2.3", "bin"), "zlib1." . $SHARED_LIB_SUFFIX);
	$BZIP_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "bzip2-1.0.5", "bin"), "bzip2." . $SHARED_LIB_SUFFIX);
	$OPENSSLA_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "openssl-0.9.8l", "bin"), "libeay32." . $SHARED_LIB_SUFFIX);
	$OPENSSLB_LIB = File::Spec->catfile( (($SYSTEM_LIB_DIR), "openssl-0.9.8l", "bin"), "ssleay32." . $SHARED_LIB_SUFFIX);
	$SERVER_EXE = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion.exe");
	$BOOST_DIR = File::Spec->catdir( ($SYSTEM_LIB_DIR, "boost-1.37.0", "lib") );
	@BOOST_LIBS = bsd_glob($BOOST_DIR . "/boost_" . $BOOST_LIB_GLOB . "-vc80-mt-1_37." . $SHARED_LIB_SUFFIX);
} elsif ($PLATFORM eq "osx") {
	$SHARED_LIB_SUFFIX = "dylib";
	$PLUGIN_LIB_SUFFIX = "so";
	$SYSTEM_LIB_DIR = File::Spec->catdir( (File::Spec->rootdir(), "usr", "local", "lib") );
	$LOGGING_LIB = File::Spec->catfile( ($SYSTEM_LIB_DIR), "liblog4cplus-1.0.3." . $SHARED_LIB_SUFFIX);
	$YAJL_LIB = File::Spec->catfile( ($SYSTEM_LIB_DIR), "libyajl.1." . $SHARED_LIB_SUFFIX);
	$SERVER_EXE = File::Spec->catfile( ("platform", "server", ".libs"), "pion");
	@BOOST_LIBS = bsd_glob($SYSTEM_LIB_DIR . "/libboost_" . $BOOST_LIB_GLOB . "*-mt-1_{35,36,37}." . $SHARED_LIB_SUFFIX);
} else {
	$SHARED_LIB_SUFFIX = "so";
	$PLUGIN_LIB_SUFFIX = "so";
	$SYSTEM_LIB_DIR = File::Spec->catdir( (File::Spec->rootdir(), "usr", "local", "lib") );
	$LOGGING_LIB = File::Spec->catfile( ($SYSTEM_LIB_DIR), "liblog4cplus-1.0." . $SHARED_LIB_SUFFIX . ".3");
	$YAJL_LIB = File::Spec->catfile( ($SYSTEM_LIB_DIR), "libyajl." . $SHARED_LIB_SUFFIX . ".1");
	$SERVER_EXE = File::Spec->catfile( ("platform", "server", ".libs"), "pion");
	@BOOST_LIBS = bsd_glob($SYSTEM_LIB_DIR . "/libboost_" . $BOOST_LIB_GLOB . "*-mt-1_{35,36,37}." . $SHARED_LIB_SUFFIX . ".1.{35,36,37}.*");
}
if ($PLATFORM =~ /^win32/i) {
	$PION_COMMON_GLOB = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion-common." . $SHARED_LIB_SUFFIX);
	$PION_NET_GLOB = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion-net." . $SHARED_LIB_SUFFIX);
	$PION_PLATFORM_GLOB = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion-platform." . $SHARED_LIB_SUFFIX);
	$PION_SERVER_GLOB = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion-server." . $SHARED_LIB_SUFFIX);
	$PION_SQLITE_GLOB = File::Spec->catfile( (($BIN_DIR), $DLL_FULL_DIR), "pion-sqlite." . $SHARED_LIB_SUFFIX);
	$NET_PLUGINS_GLOB = File::Spec->catfile( ("net", "services", ".libs"), "*." . $PLUGIN_LIB_SUFFIX);
	@PLATFORM_PLUGINS = bsd_glob("platform/" . "{codecs,protocols,databases,reactors,services}" . "/.libs/*." . $PLUGIN_LIB_SUFFIX);
} else {
	$PION_COMMON_GLOB = File::Spec->catfile( ("common", "src", ".libs"), "libpion-common-*." . $SHARED_LIB_SUFFIX);
	$PION_NET_GLOB = File::Spec->catfile( ("net", "src", ".libs"), "libpion-net-*." . $SHARED_LIB_SUFFIX);
	$PION_PLATFORM_GLOB = File::Spec->catfile( ("platform", "src", ".libs"), "libpion-platform-*." . $SHARED_LIB_SUFFIX);
	$PION_SERVER_GLOB = File::Spec->catfile( ("platform", "server", ".libs"), "libpion-server-*." . $SHARED_LIB_SUFFIX);
	$PION_SQLITE_GLOB = File::Spec->catfile( ("sqlite", ".libs"), "libpion-sqlite-*." . $SHARED_LIB_SUFFIX);
	$NET_PLUGINS_GLOB = File::Spec->catfile( ("net", "services", ".libs"), "*." . $PLUGIN_LIB_SUFFIX);
	$PLATFORM_PLUGINS_GLOB = File::Spec->catfile( ("platform", "{codecs,protocols,databases,reactors,services}", ".libs"), "*." . $PLUGIN_LIB_SUFFIX);
}


# ------------
# main process
# ------------

print "* Building binary packages for " . $TARBALL_NAME . "\n";

# clear out old files and directories (with same version)
@oldfiles = bsd_glob($PACKAGE_DIR . "*");
foreach (@oldfiles) {
	rmtree($_);
}

# prepare new directory structure
mkpath($PACKAGE_DIR);
mkdir($CONFIG_DIR) unless -d $CONFIG_DIR;
mkdir($PLUGINS_DIR) unless -d $PLUGINS_DIR;
mkdir($LIBS_DIR) unless -d $LIBS_DIR;
mkdir($UI_DIR) unless -d $UI_DIR;

# copy our third party library files into "libs"
print "Copying system library files..\n";
if ($PLATFORM =~ /^win32/i) {
	copy($ICONV_LIB, $LIBS_DIR);
	copy($LIBXML_LIB, $LIBS_DIR);
	copy($ZLIB_LIB, $LIBS_DIR);
	copy($BZIP_LIB, $LIBS_DIR);
	copy($OPENSSLA_LIB, $LIBS_DIR);
	copy($OPENSSLB_LIB, $LIBS_DIR);
}
copy($LOGGING_LIB, $LIBS_DIR);
copy($YAJL_LIB, $LIBS_DIR);
foreach (@BOOST_LIBS) {
	copy($_, $LIBS_DIR);
}

# copy the Pion shared library files into "libs"
# note: we assume that each of the file globs = a single file
print "Copying Pion library files..\n";
foreach (bsd_glob($PION_COMMON_GLOB)) {
	copy($_, $LIBS_DIR);
}
foreach (bsd_glob($PION_NET_GLOB)) {
	copy($_, $LIBS_DIR);
}
foreach (bsd_glob($PION_PLATFORM_GLOB)) {
	copy($_, $LIBS_DIR);
}
foreach (bsd_glob($PION_SERVER_GLOB)) {
	copy($_, $LIBS_DIR);
}
foreach (bsd_glob($PION_SQLITE_GLOB)) {
	copy($_, $LIBS_DIR);
}

# copy the Pion plugin files into "plugins"
print "Copying Pion plugin files..\n";
foreach (bsd_glob($NET_PLUGINS_GLOB)) {
	copy($_, $PLUGINS_DIR);
}

if ($PLATFORM =~ /^win32/i) {
	foreach (@PLATFORM_PLUGINS) {
		copy($_, $PLUGINS_DIR);
	}
} else {
	foreach (bsd_glob($PLATFORM_PLUGINS_GLOB)) {
		copy($_, $PLUGINS_DIR);
	}
}

print "Copying misc other Pion files..\n";

# copy the user interface files into "ui"
copyDirWithoutDotFiles(File::Spec->catdir( ("platform", "ui") ),
	File::Spec->catdir( ($PACKAGE_DIR, "ui") ));

# copy the configuration files
my %templates = ("PION_PLUGINS_DIRECTORY" => "../plugins",
	"PION_DATA_DIRECTORY" => "./",
	"PION_UI_DIRECTORY" => "./ui",
	"PION_LOG_CONFIG" => "logconfig.txt");
copyDirWithoutDotFiles(File::Spec->catdir( ("platform", "build", "config") ),
	File::Spec->catdir( ($PACKAGE_DIR, "config") ), %templates);

# copy other misc files
copy("COPYING", File::Spec->catfile($PACKAGE_DIR, "LICENSE.txt"));
copy("ChangeLog", File::Spec->catfile($PACKAGE_DIR, "HISTORY.txt"));
if ($PLATFORM =~ /^win32/i) {
	copy(File::Spec->catfile( ("platform", "build"), "README.bin.msvc"),
		File::Spec->catfile($PACKAGE_DIR, "README.txt"));
} else {
	copy(File::Spec->catfile( ("platform", "build"), "README.bin"),
		File::Spec->catfile($PACKAGE_DIR, "README.txt"));
}
copy(File::Spec->catfile( ("platform", "doc"), "pion-manual.pdf"),
	File::Spec->catfile($PACKAGE_DIR, "pion-manual.pdf"));

# copy the pget and pmon python scripts
copy(File::Spec->catfile( ("platform", "build"), "pget.py"),
	File::Spec->catfile($PACKAGE_DIR, "pget.py"));
copy(File::Spec->catfile( ("platform", "build"), "pmon.py"),
	File::Spec->catfile($PACKAGE_DIR, "pmon.py"));
chmod(0777, File::Spec->catfile($PACKAGE_DIR, "pget.py")) if (! ($PLATFORM =~ /^win32/i));
chmod(0777, File::Spec->catfile($PACKAGE_DIR, "pmon.py")) if (! ($PLATFORM =~ /^win32/i));

# copy the server exe
copy($SERVER_EXE, $PACKAGE_DIR);

# platform-specific finishing touches
print "Creating binary tarballs..\n";

if ($PLATFORM =~ /^win32/i) {
	# copy startup script
	copy(File::Spec->catfile( ("platform", "build"), "start_pion.bat"),
		File::Spec->catfile($PACKAGE_DIR, "start_pion.bat"));

	# create zip package
	if ($NOZIP ne "nozip") {
		require Archive::Zip;
		$zip = new Archive::Zip;
		$zip->addTree($PACKAGE_DIR, $PACKAGE_NAME);
		$zip->writeToFileNamed("$BIN_DIR/$TARBALL_NAME.zip");
		undef $zip;
	}
} else {
	# copy startup script
	copy(File::Spec->catfile( ("platform", "build"), "start_pion.sh"),
		File::Spec->catfile($PACKAGE_DIR, "start_pion.sh"));

	# set executable permissions for unix platforms
	system("chmod a+x $PACKAGE_DIR/pion $PACKAGE_DIR/start_pion.sh");

	# create tarballs
	if ($NOZIP ne "nozip") {
#		system("tar -C $BIN_DIR -czf $BIN_DIR/$TARBALL_NAME.tar.gz $PACKAGE_NAME");
		system("tar -C $BIN_DIR -cjf $BIN_DIR/$TARBALL_NAME.tar.bz2 $PACKAGE_NAME");
	}

	if ($PLATFORM eq "osx") {
		# Build application bundle for Mac OS X
		print "Creating Mac OS X application bundle..\n";
		$OSX_PACKAGE_DIR = "$BIN_DIR/osx/$PACKAGE_NAME";
		rmtree($OSX_PACKAGE_DIR);
		mkpath($OSX_PACKAGE_DIR);
		system("platypus -V $VERSION -a 'Pion Core' -u 'Atomic Labs, Inc.' -t shell -o TextWindow -i platform/build/pion-icon.png -f $PACKAGE_DIR/config -f $PACKAGE_DIR/libs -f $PACKAGE_DIR/pion -f $PACKAGE_DIR/plugins -f $PACKAGE_DIR/ui -I org.pion.Pion platform/build/start_osx.sh $OSX_PACKAGE_DIR/Pion");

		# Platypus' icon support is broken; copy file into .app package
		copy("platform/build/appIcon.icns", "$OSX_PACKAGE_DIR/Pion.app/Contents/Resources");

		# Copy other misc files
		copy("COPYING", "$OSX_PACKAGE_DIR/LICENSE.txt");
		copy("ChangeLog", "$OSX_PACKAGE_DIR/HISTORY.txt");
		copy("platform/build/README.bin.osx", "$OSX_PACKAGE_DIR/README.txt");
		copy("platform/doc/pion-manual.pdf", "$OSX_PACKAGE_DIR/pion-manual.pdf");

		# create zip package
		if ($NOZIP ne "nozip") {
			require Archive::Zip;
			$zip = new Archive::Zip;
			$zip->addTree($OSX_PACKAGE_DIR, $PACKAGE_NAME);
			$zip->writeToFileNamed("$BIN_DIR/${TARBALL_NAME}_app.zip");
			undef $zip;
		}
	}
}

if ($PLATFORM =~ /^win32/i) {
	print "Creating Pion installation package..\n";
	$INSTALLER_SCRIPT=File::Spec->catfile( ("platform", "build"), "build_installer.bat");
	system("$INSTALLER_SCRIPT $PACKAGE_DIR $VERSION");
	move("pion-platform.msi", File::Spec->catfile( ($BIN_DIR, "$TARBALL_NAME.msi") ));
}

print "* Done creating binary packages.\n";
