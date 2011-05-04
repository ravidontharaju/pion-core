set buildscripts=C:\dojo-release-1.6.1-src\util\buildscripts

copy pion.profile.js %buildscripts%\profiles

cd %buildscripts%

copy /y build.bat build-with-pause.bat
echo pause >> build-with-pause.bat

rem Create a release build in C:\dojo-release-1.6.1-src\release\dojo-release...
build-with-pause.bat profile=pion action=release releaseName=dojo-release layerOptimize=shrinksafe.keepLines localeList="en-us,en-gb,en,ROOT"

