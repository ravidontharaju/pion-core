@echo off
SET AI_DIR="%ProgramFiles%\Caphyon\Advanced Installer 7.0.1"
SET AI_EXE="AdvancedInstaller.exe"
SET INSTALL_PRJ="pion-platform.aip"
IF EXIST %AI_DIR%\%AI_EXE% GOTO INST
@echo Error: Advanced Installer is not found at %AI_DIR%; aborting installer build script
EXIT -1
:INST 
SET AI_EXE=%AI_DIR%\%AI_EXE%
IF EXIST %INSTALL_PRJ% del %INSTALL_PRJ%
copy %INSTALL_PRJ%.tmpl %INSTALL_PRJ%

%AI_EXE% /edit %INSTALL_PRJ% /SetVersion %2
%AI_EXE% /edit %INSTALL_PRJ% /NewSync APPDIR\ %1
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name "Start Pion" -dir SHORTCUTDIR -target APPDIR\start_pion.bat -wkdir APPDIR
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name License -dir SHORTCUTDIR -target APPDIR\LICENSE.txt
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name ReadMe -dir SHORTCUTDIR -target APPDIR\README.txt
%AI_EXE% /edit %INSTALL_PRJ% /NewShortcut -name "Pion Documentation" -dir SHORTCUTDIR -target APPDIR\pion-manual.pdf
%AI_EXE% /build %INSTALL_PRJ% 
