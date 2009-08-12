rem dojo-for-pion.js contains all the Dojo code that Pion needs, but no Pion code.
rem It's useful for debugging Pion code without having to load a zillion Dojo files.
set buildscripts=C:\dojo-release-1.3.2-src\util\buildscripts

copy dojo-for-pion.profile.js %buildscripts%\profiles

cd %buildscripts%

copy /y build.bat build-with-pause.bat
echo pause >> build-with-pause.bat

rem Create a release build in C:\dojo-release-1.3.2-src\release\dojo-release...
build-with-pause.bat profile=dojo-for-pion action=release releaseName=dojo-release layerOptimize=shrinksafe.keepLines localeList="en-us,en-gb,en,ROOT"
