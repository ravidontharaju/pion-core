// pion-systray.cpp : Defines the entry point for the application.
//
#include "stdafx.h"
#include "pion-systray.h"
#include "service_commands.h"

#define MAX_LOADSTRING 100
#define WM_TRAY_ICON_NOTIFY	(WM_USER + 1)

// Global Variables:
HINSTANCE hInst;								// current instance
TCHAR szTitle[MAX_LOADSTRING];					// The title bar text
TCHAR szWindowClass[MAX_LOADSTRING];			// the main window class name

// Forward declarations of functions included in this code module:
ATOM				MyRegisterClass(HINSTANCE hInstance);
BOOL				InitInstance(HINSTANCE, int);
LRESULT CALLBACK	WndProc(HWND, UINT, WPARAM, LPARAM);
INT_PTR CALLBACK	About(HWND, UINT, WPARAM, LPARAM);

int APIENTRY _tWinMain(HINSTANCE hInstance,
                     HINSTANCE hPrevInstance,
                     LPTSTR    lpCmdLine,
                     int       nCmdShow)
{
	UNREFERENCED_PARAMETER(hPrevInstance);
	UNREFERENCED_PARAMETER(lpCmdLine);

	MSG msg;
	HACCEL hAccelTable;

	// Initialize global strings
	LoadString(hInstance, IDS_APP_TITLE, szTitle, MAX_LOADSTRING);
	LoadString(hInstance, IDC_PIONSYSTRAY, szWindowClass, MAX_LOADSTRING);
	MyRegisterClass(hInstance);

	// Perform application initialization:
	if (!InitInstance (hInstance, nCmdShow))
	{
		return FALSE;
	}

	hAccelTable = LoadAccelerators(hInstance, MAKEINTRESOURCE(IDC_PIONSYSTRAY));

	// Main message loop:
	while (GetMessage(&msg, NULL, 0, 0))
	{
		if (!TranslateAccelerator(msg.hwnd, hAccelTable, &msg))
		{
			TranslateMessage(&msg);
			DispatchMessage(&msg);
		}
	}

	return (int) msg.wParam;
}



//
//  FUNCTION: MyRegisterClass()
//
//  PURPOSE: Registers the window class.
//
//  COMMENTS:
//
//    This function and its usage are only necessary if you want this code
//    to be compatible with Win32 systems prior to the 'RegisterClassEx'
//    function that was added to Windows 95. It is important to call this function
//    so that the application will get 'well formed' small icons associated
//    with it.
//
ATOM MyRegisterClass(HINSTANCE hInstance)
{
	WNDCLASSEX wcex;

	wcex.cbSize = sizeof(WNDCLASSEX);

	wcex.style			= CS_HREDRAW | CS_VREDRAW;
	wcex.lpfnWndProc	= WndProc;
	wcex.cbClsExtra		= 0;
	wcex.cbWndExtra		= 0;
	wcex.hInstance		= hInstance;
	wcex.hIcon			= LoadIcon(hInstance, MAKEINTRESOURCE(IDI_PIONSYSTRAY));
	wcex.hCursor		= LoadCursor(NULL, IDC_ARROW);
	wcex.hbrBackground	= (HBRUSH)(COLOR_WINDOW+1);
	wcex.lpszMenuName	= MAKEINTRESOURCE(IDC_PIONSYSTRAY);
	wcex.lpszClassName	= szWindowClass;
	wcex.hIconSm		= LoadIcon(wcex.hInstance, MAKEINTRESOURCE(IDI_SMALL));

	return RegisterClassEx(&wcex);
}

//
// Tray Icon create/destroy
// 
UINT CreateTrayIcon( HINSTANCE hInstance, HWND hWnd )
{
    NOTIFYICONDATA niData; 
    ZeroMemory(&niData,sizeof(NOTIFYICONDATA));

	niData.cbSize = sizeof(niData);
	niData.uFlags = NIF_ICON | NIF_MESSAGE;
	niData.hWnd = hWnd;
	niData.uCallbackMessage = WM_TRAY_ICON_NOTIFY;

	HICON hIcon = (HICON) LoadImage(hInstance, MAKEINTRESOURCE(IDI_SMALL), IMAGE_ICON, 
			GetSystemMetrics(SM_CXSMICON), GetSystemMetrics(SM_CYSMICON), LR_DEFAULTCOLOR);

	niData.hIcon = hIcon;

	BOOL rc = Shell_NotifyIcon(NIM_ADD,&niData);
	return rc;
}

void DestroyTrayIcon(HWND hWnd)
{
    NOTIFYICONDATA niData; 
    ZeroMemory(&niData,sizeof(NOTIFYICONDATA));

	niData.cbSize = sizeof(niData);
	niData.uFlags = 0;
	niData.hWnd = hWnd;

	Shell_NotifyIcon(NIM_DELETE,&niData);
}

// Display a "error" message box with given text and string text for the system error
void DisplayErrorDialog(HWND hWnd, LPCTSTR lpszText, DWORD error)
{
	TCHAR szBuff[16*1024];
	TCHAR szMsg[32*1024];

	if(lpszText) {
		_tcscpy(szMsg, lpszText);
		_tcscat(szMsg, _T("\n"));
	} else {
		_tcscpy(szMsg, _T("Unspecified error occurred.\n"));
	}

	if( FormatMessage(FORMAT_MESSAGE_FROM_SYSTEM , NULL, error, MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
		szBuff, sizeof(szBuff)/sizeof(szBuff[0]), NULL) == 0) {
		_tcscat(szMsg, _T("Detailed error information unavailable"));
	} else {
		_tcscat(szMsg, szBuff);
	}

	MessageBox(hWnd, szMsg, _T("Pion"), MB_OK | MB_ICONERROR);
}


//
// Shows the context menu for the tray icon and handles the menu commands
//
void ShowContextMenu(HWND hWnd)
{
	// load menu
	HMENU hMenu = LoadMenu(hInst, MAKEINTRESOURCE(IDM_TRAY_CONTEXT));

	// get the tray icon coords
	NOTIFYICONIDENTIFIER niid;
	RECT rect;
	ZeroMemory(&niid, sizeof(niid));
	ZeroMemory(&rect, sizeof(rect));
	niid.cbSize = sizeof(niid);
	niid.hWnd = hWnd;
	Shell_NotifyIconGetRect(&niid, &rect);

	// get the current state of Pion Service to enable/disable menu items
	DWORD status = 0; 
	BOOL enableStart = FALSE;
	BOOL enableStop = FALSE;

	if(GetPionServiceStatus(status)) {
		switch(status) 
		{
		case SERVICE_STOPPED:
		case SERVICE_PAUSED:
			enableStart = TRUE;
			break;
		case SERVICE_RUNNING:
			enableStop = TRUE;
			break;
		}
	} else {
		//TODO: display error message? 
	}

	// prepare the context menu
	HMENU hContextMenu = GetSubMenu(hMenu, 0);
	EnableMenuItem(hContextMenu, ID_STARTPIONSERVICE, MF_BYCOMMAND | (enableStart ? MF_ENABLED : MF_DISABLED) );
	EnableMenuItem(hContextMenu, ID_STOPPIONSERVICE, MF_BYCOMMAND | (enableStop ? MF_ENABLED : MF_DISABLED) );

	// display the menu, take the command, and destroy the menu
	SetForegroundWindow(hWnd);
	UINT nCmd = (UINT)TrackPopupMenu(hContextMenu, TPM_RETURNCMD, rect.left, rect.top, 0, hWnd, NULL);
	DestroyMenu(hMenu);

	// process commands
	DWORD rc = 0;
	switch(nCmd)
	{
	case IDM_EXIT:
		DestroyWindow(hWnd);
		break;

	case ID_STARTPIONSERVICE:
		rc = StartPionService();
		if(rc) {
			DisplayErrorDialog(hWnd, _T("Failed to start Pion service"), rc);
		}
		break;

	case ID_STOPPIONSERVICE:
		rc = StopPionService();
		if(rc) {
			DisplayErrorDialog(hWnd, _T("Failed to start Pion service"), rc);
		}
		break;
	}
}

//
//   FUNCTION: InitInstance(HINSTANCE, int)
//
//   PURPOSE: Saves instance handle and creates main window
//
//   COMMENTS:
//
//        In this function, we save the instance handle in a global variable and
//        create and display the main program window.
//
BOOL InitInstance(HINSTANCE hInstance, int nCmdShow)
{
   HWND hWnd;

   hInst = hInstance; // Store instance handle in our global variable

   hWnd = CreateWindow(szWindowClass, szTitle, WS_OVERLAPPEDWINDOW,
      CW_USEDEFAULT, 0, CW_USEDEFAULT, 0, NULL, NULL, hInstance, NULL);

   if (!hWnd)
   {
      return FALSE;
   }

   CreateTrayIcon(hInstance, hWnd);
   ShowWindow(hWnd, SW_HIDE);
   UpdateWindow(hWnd);


   return TRUE;
}

//
//  FUNCTION: WndProc(HWND, UINT, WPARAM, LPARAM)
//
//  PURPOSE:  Processes messages for the main window.
//
//  WM_COMMAND	- process the application menu
//  WM_PAINT	- Paint the main window
//  WM_DESTROY	- post a quit message and return
//
//
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam)
{
	int wmId, wmEvent;
	PAINTSTRUCT ps;
	HDC hdc;

	switch (message)
	{
	case WM_COMMAND:
		wmId    = LOWORD(wParam);
		wmEvent = HIWORD(wParam);
		// Parse the menu selections:
		switch (wmId)
		{
		case IDM_ABOUT:
			DialogBox(hInst, MAKEINTRESOURCE(IDD_ABOUTBOX), hWnd, About);
			break;
		case IDM_EXIT:
			DestroyWindow(hWnd);
			break;
		default:
			return DefWindowProc(hWnd, message, wParam, lParam);
		}
		break;
	case WM_PAINT:
		hdc = BeginPaint(hWnd, &ps);
		// TODO: Add any drawing code here...
		EndPaint(hWnd, &ps);
		break;
	case WM_DESTROY:
		DestroyTrayIcon(hWnd);
		PostQuitMessage(0);
		break;

	// SysTray Icon notifications
	case WM_TRAY_ICON_NOTIFY:
		switch(lParam)
		{
		case WM_CONTEXTMENU:
		case WM_RBUTTONUP:
		case WM_LBUTTONUP:
			ShowContextMenu(hWnd);
			break;
		}
		break;
	default:
		return DefWindowProc(hWnd, message, wParam, lParam);
	}
	return 0;
}

// Message handler for about box.
INT_PTR CALLBACK About(HWND hDlg, UINT message, WPARAM wParam, LPARAM lParam)
{
	UNREFERENCED_PARAMETER(lParam);
	switch (message)
	{
	case WM_INITDIALOG:
		return (INT_PTR)TRUE;

	case WM_COMMAND:
		if (LOWORD(wParam) == IDOK || LOWORD(wParam) == IDCANCEL)
		{
			EndDialog(hDlg, LOWORD(wParam));
			return (INT_PTR)TRUE;
		}
		break;
	}
	return (INT_PTR)FALSE;
}
