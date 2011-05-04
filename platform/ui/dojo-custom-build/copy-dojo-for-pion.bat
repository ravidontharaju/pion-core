rem Copy dojo-for-pion files onto the local dojo-release folder.
set releaseDir=C:\dojo-release-1.6.1-src\release\dojo-release
copy /y %releaseDir%\dojo\dojo.js                   ..\dojo-release\dojo\dojo.js
copy /y %releaseDir%\dojo\dojo-for-pion.js          ..\dojo-release\dojo\dojo-for-pion.js
copy /y %releaseDir%\dojo\nls\dojo-for-pion_*.js    ..\dojo-release\dojo\nls

pause
