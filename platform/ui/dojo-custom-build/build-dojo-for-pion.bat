rem dojo-for-pion.js contains all the Dojo code that Pion needs, but no Pion code.
rem It's useful for debugging Pion code without having to load a zillion Dojo files.
set buildscripts=C:\dojo-release-1.1.1-src\util\buildscripts

copy dojo-for-pion.profile.js %buildscripts%\profiles

rem Create a release build in C:\dojo-release-1.1.1-src\release\dojo-release...
cd %buildscripts%
build.bat profile=dojo-for-pion action=release releaseName=dojo-release layerOptimize=shrinksafe.keepLines
