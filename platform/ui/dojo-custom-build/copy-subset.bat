rem Copy a subset of dojo-release (containing all needed files) onto the local dojo-release folder.

set releaseDir=C:\dojo-release-1.1.0-src\release\dojo-release

copy /y %releaseDir%\dojo\resources            ..\dojo-release\dojo\resources
copy /y %releaseDir%\dojo\nls\pion-dojo_en*.js ..\dojo-release\dojo\nls
copy /y %releaseDir%\dojo\dojo.js              ..\dojo-release\dojo\dojo.js
copy /y %releaseDir%\dojo\pion-dojo.js         ..\dojo-release\dojo\pion-dojo.js
copy /y %releaseDir%\dojo\build.txt            ..\dojo-release\dojo\build.txt
copy /y %releaseDir%\dojo\LICENSE              ..\dojo-release\dojo\LICENSE

copy /y %releaseDir%\dijit\templates           ..\dojo-release\dijit\templates
copy /y %releaseDir%\dijit\themes\*.css        ..\dojo-release\dijit\themes
copy /y %releaseDir%\dijit\themes\tundra       ..\dojo-release\dijit\themes\tundra
copy /y %releaseDir%\dijit\themes\a11y         ..\dojo-release\dijit\themes\a11y

copy /y %releaseDir%\dojox\gfx\*.js            ..\dojo-release\dojox\gfx
copy /y %releaseDir%\dojox\grid\_grid          ..\dojo-release\dojox\grid\_grid

pause
