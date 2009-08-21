# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

ACLOCAL_AMFLAGS = -I common/build -I platform/build

SUBDIRS = sqlite @PION_COMMON_MAKEDIRS@ @PION_NET_MAKEDIRS@ platform

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-platform.pc

EXTRA_DIST = autogen.sh *.sln *.aip.tmpl *.xcodeproj winutils

include common/build/doxygen.inc
include platform/build/platform.inc

all-local: docs
	@(cd platform/build; tar cf - --exclude=\\.svn config) | (cd platform; tar xf -)
	@sed -e 's;<LogConfig>.*</LogConfig>;<LogConfig>../build/config/logconfig.txt</LogConfig>;' -e 's;<DataDirectory>.*</DataDirectory>;<DataDirectory>.</DataDirectory>;' -e 's;<PluginPath>.*</PluginPath>;<PluginPath>../../platform/codecs/.libs/</PluginPath><PluginPath>../../platform/databases/.libs/</PluginPath><PluginPath>../../platform/reactors/.libs</PluginPath><PluginPath>../../platform/protocols/.libs/</PluginPath><PluginPath>../../platform/services/.libs/</PluginPath><PluginPath>../../net/services/.libs/</PluginPath>;' platform/build/config/platform.xml > platform/config/platform.xml
	@sed -e 's;\@PION_UI_DIRECTORY\@;../../platform/ui;' platform/build/config/services.xml > platform/config/services.xml

clean-local: clean-docs
	@rm -rf platform/config/*

install-data-local:
	@if ! test -d $(sysconfdir)/pion; then mkdir -p $(sysconfdir)/pion; fi
	@(cd platform/build/config; tar cf - --exclude=\\.svn *) | (cd $(sysconfdir)/pion; tar xf -)
	@sed -e 's;\@PION_PLUGINS_DIRECTORY\@;@PION_PLUGINS_DIRECTORY@;' -e 's;\@PION_DATA_DIRECTORY\@;$(localstatedir)/pion;' platform/build/config/platform.xml > $(sysconfdir)/pion/platform.xml
	@sed -e 's;\@PION_UI_DIRECTORY\@;$(datadir)/pion/ui;' platform/build/config/services.xml > $(sysconfdir)/pion/services.xml
	@if ! test -d $(datadir)/pion; then mkdir -p $(datadir)/pion; fi
	@if ! test -d $(datadir)/pion/ui; then mkdir $(datadir)/pion/ui; fi
	@if ! test -d $(datadir)/pion/doc; then mkdir $(datadir)/pion/doc; fi
	@(cd platform/ui; tar cf - --exclude=\\.svn *) | (cd $(datadir)/pion/ui; tar xf -)
	@(cd platform/doc; tar cf - --exclude=\\.svn *) | (cd $(datadir)/pion/doc; tar xf -)
	@cp COPYING $(datadir)/pion/doc/LICENSE.txt
	@cp ChangeLog $(datadir)/pion/doc/HISTORY.txt
	@cp platform/build/README.bin $(datadir)/pion/doc/README
	@cp platform/build/pion-icon.png $(datadir)/pion/pion-icon.png
	@if ! test -d $(localstatedir)/pion; then mkdir -p $(localstatedir)/pion; fi
