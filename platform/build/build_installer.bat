@echo on

REM %ProgramFiles% is not defined when this file is run by make_binary.pl on ws03-vc9-32.
REM SET AI_DIR="%ProgramFiles%\Caphyon\Advanced Installer 7.3.1"

SET AI_DIR="C:\Program Files\Caphyon\Advanced Installer 7.7\bin\x86"

SET AI_EXE="advinst.exe"
SET INSTALL_PRJ="pion-platform.aip"
IF EXIST %AI_DIR%\%AI_EXE% GOTO INST
SET AI_DIR="C:\Program Files (x86)\Caphyon\Advanced Installer 7.7\bin\x86"
IF EXIST %AI_DIR%\%AI_EXE% GOTO INST
@echo Error: Advanced Installer is not found at %AI_DIR%; aborting installer build script
EXIT -1
:INST 
SET AI_EXE=%AI_DIR%\%AI_EXE%
IF EXIST %INSTALL_PRJ% del %INSTALL_PRJ%
copy %INSTALL_PRJ%.tmpl %INSTALL_PRJ%

copy platform\build\win32\config\*.* %1\config\
copy %1\pion.exe platform\build\win32\pion.exe
move "%1\config" "%1\config-new"

%AI_EXE% /edit %INSTALL_PRJ% /SetVersion %2
%AI_EXE% /edit %INSTALL_PRJ% /NewSync APPDIR\ %1
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name License -dir SHORTCUTDIR -target APPDIR\LICENSE.txt
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name ReadMe -dir SHORTCUTDIR -target APPDIR\README.txt
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name "Pion Documentation" -dir SHORTCUTDIR -target APPDIR\pion-manual.pdf
%AI_EXE% /build %INSTALL_PRJ% 

del platform\build\win32\pion.exe
move "%1\config-new" "%1\config"
