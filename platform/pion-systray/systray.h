#pragma once

#include "resource.h"

#define WM_TRAY_ICON_NOTIFY	(WM_USER + 1)

BOOL CreateTrayIcon(HINSTANCE hInstance, LPCTSTR pstrIcon, HWND hWnd);

void DestroyTrayIcon(HWND hWnd);

BOOL SetTrayIcon(HINSTANCE hInstance, HWND hWnd, LPCTSTR pstrIcon);


