@ECHO OFF
SET NSSM_LIBS=C:\Atomic Labs\pion-libraries
SETLOCAL EnableDelayedExpansion
SET INCLUDE=%INCLUDE%
SET LIB=%LIB%
SET PATH=%PATH%
SET opts=/nologo /platform:Win32 /logcommands /nohtmllog /M1 /useenv
SET conf=Release
FOR %%I IN (%*) DO (SET opt=%%~I
  IF "!opt:~0,1!"=="/" SET opts=!opts! %%I
  IF "!opt!"=="debug" SET conf=Debug
  IF "!opt!"=="release" SET conf=Release)
FOR %%S in (*.sln) DO vcbuild %opts% "/logfile:%%~nS[%conf%].log" %%S "%conf%|Win32"
