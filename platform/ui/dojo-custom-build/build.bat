set buildscripts=C:\dojo-release-1.1.1-src\util\buildscripts

copy pion.profile.js %buildscripts%\profiles

cd %buildscripts%
rem Create a release build in C:\dojo-release-1.1.1-src\release\dojo-release...
build.bat profile=pion action=release releaseName=dojo-release
