rem Copy a subset of dojo-release (containing all needed files) onto the local dojo-release folder.

set releaseDir=C:\dojo-release-1.2.3-src\release\dojo-release

xcopy /y /s %releaseDir%\dojo\resources          ..\dojo-release\dojo\resources
copy /y %releaseDir%\dojo\nls\pion-dojo_*.js     ..\dojo-release\dojo\nls
copy /y %releaseDir%\dojo\dojo.js                ..\dojo-release\dojo\dojo.js
copy /y %releaseDir%\dojo\pion-dojo.js           ..\dojo-release\dojo\pion-dojo.js
copy /y %releaseDir%\dojo\build.txt              ..\dojo-release\dojo\build.txt
copy /y %releaseDir%\dojo\LICENSE                ..\dojo-release\dojo\LICENSE
copy /y %releaseDir%\dojo\_firebug               ..\dojo-release\dojo\_firebug

copy /y %releaseDir%\dijit\templates             ..\dojo-release\dijit\templates
copy /y %releaseDir%\dijit\themes\*.css          ..\dojo-release\dijit\themes
xcopy /y /s %releaseDir%\dijit\themes\tundra     ..\dojo-release\dijit\themes\tundra
copy /y %releaseDir%\dijit\themes\a11y           ..\dojo-release\dijit\themes\a11y

copy /y %releaseDir%\dojox\gfx                              ..\dojo-release\dojox\gfx
copy /y %releaseDir%\dojox\grid\compat\_grid\tundraGrid.css ..\dojo-release\dojox\grid\compat\_grid\tundraGrid.css
copy /y %releaseDir%\dojox\grid\compat\_grid\images         ..\dojo-release\dojox\grid\compat\_grid\images
xcopy /y /s %releaseDir%\dojox\grid\resources               ..\dojo-release\dojox\grid\resources
copy /y %releaseDir%\dojox\data\QueryReadStore.js           ..\dojo-release\dojox\data\QueryReadStore.js

rem The remaining files are currently only needed for AggregateReactor.
copy /y %releaseDir%\dojox\html\_base.js                      ..\dojo-release\dojox\html\_base.js
copy /y %releaseDir%\dojox\layout\ContentPane.js              ..\dojo-release\dojox\layout\ContentPane.js
copy /y %releaseDir%\dojox\layout\FloatingPane.js             ..\dojo-release\dojox\layout\FloatingPane.js
copy /y %releaseDir%\dojox\layout\ResizeHandle.js             ..\dojo-release\dojox\layout\ResizeHandle.js
copy /y %releaseDir%\dojox\layout\resources\FloatingPane.css  ..\dojo-release\dojox\layout\resources\FloatingPane.css
copy /y %releaseDir%\dojox\layout\resources\FloatingPane.html ..\dojo-release\dojox\layout\resources\FloatingPane.html
copy /y %releaseDir%\dojox\layout\resources\ResizeHandle.css  ..\dojo-release\dojox\layout\resources\ResizeHandle.css
copy /y %releaseDir%\dojox\layout\resources\icons\resize.png  ..\dojo-release\dojox\layout\resources\icons\resize.png

pause
