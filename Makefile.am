# -----------------------------------------
# pion-platform automake configuration file 
# -----------------------------------------

SUBDIRS = @PION_COMMON_MAKEDIRS@ @PION_NET_MAKEDIRS@ @PION_REACTOR_MAKEDIRS@ platform

pkgconfigdir = $(libdir)/pkgconfig
pkgconfig_DATA = pion-platform.pc

EXTRA_DIST = common/doc net/doc reactor/doc \
	common/build/ax_boost_base.m4 \
	common/build/ax_compiler_vendor.m4 \
	autogen.sh pion-platform.xcodeproj pion-platform.sln
