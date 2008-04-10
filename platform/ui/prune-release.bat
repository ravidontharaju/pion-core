rem remove most unneeded files from dojo-release

rem remove top level unneeded folders
rmdir /S /Q dojo-release\pion
rmdir /S /Q dojo-release\plugins
rmdir /S /Q dojo-release\util

rem remove everything from dojo except resources\, nls\pion-dojo_en*.js and a few top level files.
mkdir dojo-release\dojo-new
move dojo-release\dojo\resources dojo-release\dojo-new\resources
mkdir dojo-release\dojo-new\nls
move dojo-release\dojo\nls\pion-dojo_en*.js dojo-release\dojo-new\nls
move dojo-release\dojo\dojo.js dojo-release\dojo-new\dojo.js
move dojo-release\dojo\pion-dojo.js dojo-release\dojo-new\pion-dojo.js
move dojo-release\dojo\build.txt dojo-release\dojo-new\build.txt
move dojo-release\dojo\LICENSE dojo-release\dojo-new\LICENSE
rmdir /S /Q dojo-release\dojo
move dojo-release\dojo-new dojo-release\dojo

rem remove everything from dijit except templates\ and parts of themes\
mkdir dojo-release\dijit-new
move dojo-release\dijit\templates dojo-release\dijit-new\templates
mkdir dojo-release\dijit-new\themes
move dojo-release\dijit\themes\*.css dojo-release\dijit-new\themes
move dojo-release\dijit\themes\tundra dojo-release\dijit-new\themes\tundra
move dojo-release\dijit\themes\a11y dojo-release\dijit-new\themes\a11y
rmdir /S /Q dojo-release\dijit
move dojo-release\dijit-new dojo-release\dijit

rem remove everything from dojox except top level gfx files and grid\_grid
move dojo-release\dojox\gfx dojo-release\gfx
move dojo-release\dojox\grid\_grid dojo-release\_grid
rmdir /S /Q dojo-release\dojox
rmdir /S /Q dojo-release\gfx\demos
rmdir /S /Q dojo-release\gfx\tests
mkdir dojo-release\dojox
move dojo-release\gfx dojo-release\dojox\gfx
mkdir dojo-release\dojox\grid
move dojo-release\_grid dojo-release\dojox\grid\_grid

