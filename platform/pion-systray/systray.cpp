#include "stdafx.h"
#include "systray.h"

//
// Tray Icon create
// 
BOOL CreateTrayIcon( HINSTANCE hInstance, LPCTSTR pstrIcon, HWND hWnd )
{
    NOTIFYICONDATA niData; 
    ZeroMemory(&niData,sizeof(NOTIFYICONDATA));

	niData.cbSize = sizeof(niData);
	niData.uFlags = NIF_ICON | NIF_MESSAGE;
	niData.hWnd = hWnd;
	niData.uCallbackMessage = WM_TRAY_ICON_NOTIFY;

	HICON hIcon = (HICON) LoadImage(hInstance, MAKEINTRESOURCE(pstrIcon), IMAGE_ICON, 
			GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON), LR_DEFAULTCOLOR | LR_SHARED );

	niData.hIcon = hIcon;

	return Shell_NotifyIcon(NIM_ADD,&niData);
}

//
// Tray Icon destroy
//
void DestroyTrayIcon(HWND hWnd)
{
    NOTIFYICONDATA niData; 
    ZeroMemory(&niData,sizeof(NOTIFYICONDATA));

	niData.cbSize = sizeof(niData);
	niData.uFlags = 0;
	niData.hWnd = hWnd;

	Shell_NotifyIcon(NIM_DELETE,&niData);
}
//
// Tray Icon modify
//
BOOL SetTrayIcon(HINSTANCE hInstance, HWND hWnd, LPCTSTR pstrIcon)
{
    NOTIFYICONDATA niData; 
    ZeroMemory(&niData,sizeof(NOTIFYICONDATA));

	niData.cbSize = sizeof(niData);
	niData.uFlags = NIF_ICON | NIF_MESSAGE;
	niData.hWnd = hWnd;
	niData.uCallbackMessage = WM_TRAY_ICON_NOTIFY;

	HICON hIcon = LoadIcon(hInstance, pstrIcon);
	niData.hIcon = hIcon;

	BOOL rc = Shell_NotifyIcon(NIM_MODIFY,&niData);
	return rc;
}
