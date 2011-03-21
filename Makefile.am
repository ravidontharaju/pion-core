# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

ACLOCAL_AMFLAGS = -I m4 -I common/build -I platform/build

SUBDIRS = sqlite @PION_COMMON_MAKEDIRS@ @PION_NET_MAKEDIRS@ platform

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-platform.pc

EXTRA_DIST = autogen.sh *.sln *.aip.tmpl *.xcodeproj

include common/build/doxygen.inc
include platform/build/platform.inc

all-local: docs
	@./common/build/make_config.pl platform/build/config platform/config

clean-local: clean-docs
	@rm -rf platform/config/*

install-data-local:
	@if ! test -d $(sysconfdir); then mkdir -p $(sysconfdir); fi
	@./common/build/make_config.pl platform/build/config $(sysconfdir)/pion "PION_PLUGINS_DIRECTORY=@PION_PLUGINS_DIRECTORY@" "PION_DATA_DIRECTORY=$(localstatedir)/pion" "PION_UI_DIRECTORY=$(datadir)/pion/ui"
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
