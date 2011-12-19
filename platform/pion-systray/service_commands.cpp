#include "stdafx.h"
#include "service_commands.h"
#include "systray.h"

#ifdef PION_STATIC_LINKING
static LPCTSTR strPionServiceName = _T("cloudmeter");
#else
static LPCTSTR strPionServiceName = _T("pion");
#endif
static DWORD dwSCTimeout = 20000; // 20 sec timeout for service commands


BOOL IsUserAdmin(VOID)
{
	BOOL b;
	SID_IDENTIFIER_AUTHORITY NtAuthority = SECURITY_NT_AUTHORITY;
	PSID AdministratorsGroup; 
	b = AllocateAndInitializeSid( &NtAuthority, 2, SECURITY_BUILTIN_DOMAIN_RID,
		DOMAIN_ALIAS_RID_ADMINS, 0, 0, 0, 0, 0, 0, &AdministratorsGroup); 
	
	if (b){
		if (!CheckTokenMembership( NULL, AdministratorsGroup, &b)) {
			b = FALSE;
		} 
		FreeSid(AdministratorsGroup); 
	}

	return b;
}

BOOL GetPionServiceStatus(DWORD& status)
{
	// Open the service control manager on local computer w/read access
	SC_HANDLE hScm = OpenSCManager( NULL, NULL, GENERIC_READ);
	if (hScm == NULL) {
		status = GetLastError();
		return FALSE;
	}
	
	// Open Pion Service
	SC_HANDLE hService = OpenService(hScm, strPionServiceName, SERVICE_QUERY_STATUS | SERVICE_ENUMERATE_DEPENDENTS);  
 	if (hService == NULL) {
		status = GetLastError();
		CloseServiceHandle(hScm);
		return FALSE;
	}

	// Query the service status
	SERVICE_STATUS_PROCESS ssp;
	DWORD dwBytesNeeded = 0;
	ZeroMemory(&ssp, sizeof(ssp));
     if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO, (LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded)) {
        status = GetLastError();
		CloseServiceHandle(hService);
		CloseServiceHandle(hScm);
		return FALSE;
    }

	// set output parameter and cleanup
	status = ssp.dwCurrentState;
	CloseServiceHandle(hService);
	CloseServiceHandle(hScm);

	return TRUE;
}

DWORD StartPionService()
{
	DWORD rc = 0;
	// Open the service control manager on local computer w/all access
	SC_HANDLE hScm = OpenSCManager( NULL, NULL, STANDARD_RIGHTS_REQUIRED | SC_MANAGER_CONNECT);
	if (hScm == NULL) {
		return GetLastError();
	}

	// Open Pion Service
	SC_HANDLE hService = OpenService(hScm, strPionServiceName, 
		STANDARD_RIGHTS_REQUIRED | SERVICE_START | SERVICE_QUERY_STATUS );  
 	if (hService == NULL) {
		rc = GetLastError();
		CloseServiceHandle(hScm);
		return rc;
	}

    DWORD dwStartTime = GetTickCount();

	// send the Stop command
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
    if (!StartService( hService, 0, NULL)) {
        rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		return rc;
    }

	DWORD dwBytesNeeded = 0;
	// query the service status
	if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
		(LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
		rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		return rc;
	}

	CloseServiceHandle(hScm);
	CloseServiceHandle(hService);

	return 0;
}

DWORD StopPionService()
{
	DWORD rc = 0;
	// Open the service control manager on local computer w/all access
	SC_HANDLE hScm = OpenSCManager( NULL, NULL, STANDARD_RIGHTS_REQUIRED | SC_MANAGER_CONNECT);
	if (hScm == NULL) {
		return GetLastError();
	}

	// Open Pion Service
	SC_HANDLE hService = OpenService(hScm, strPionServiceName, 
		STANDARD_RIGHTS_REQUIRED | SERVICE_STOP | SERVICE_QUERY_STATUS );  
 	if (hService == NULL) {
		rc = GetLastError();
		CloseServiceHandle(hScm);
		return rc;
	}

    DWORD dwStartTime = GetTickCount();

	// send the Stop command
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
    if (!ControlService( hService, SERVICE_CONTROL_STOP, (LPSERVICE_STATUS) &ssp)) {
        rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		return rc;
    }

	CloseServiceHandle(hScm);
	CloseServiceHandle(hService);

	return 0;
}

DWORD WaitForServiceControlOpFinish(int waitSec, DWORD* pdwStatus)
{
	// Open the service control manager on local computer w/all access
	SC_HANDLE hScm = OpenSCManager( NULL, NULL, STANDARD_RIGHTS_REQUIRED | SC_MANAGER_CONNECT);
	if (hScm == NULL) {
		return GetLastError();
	}

	// Open Pion Service
	SC_HANDLE hService = OpenService(hScm, strPionServiceName, 
		STANDARD_RIGHTS_REQUIRED | SERVICE_STOP | SERVICE_QUERY_STATUS );  
 	if (hService == NULL) {
		DWORD rc = GetLastError();
		CloseServiceHandle(hScm);
		return rc;
	}

	DWORD dwBytesNeeded = 0;
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
	// query the service status
	if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
		(LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
		DWORD rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		return rc;
	}

	BOOL isPending = (ssp.dwCurrentState == SERVICE_START_PENDING) || 
				(ssp.dwCurrentState == SERVICE_STOP_PENDING) ||
				(ssp.dwCurrentState == SERVICE_CONTINUE_PENDING) || 
				(ssp.dwCurrentState == SERVICE_PAUSE_PENDING);

	int cnt = 0;
	while(isPending && cnt < waitSec)
	{
		Sleep(1000);
		++cnt;
		// query the service status again
		if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
			(LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
			DWORD rc = GetLastError();
			CloseServiceHandle(hScm);
			CloseServiceHandle(hService);
			return rc;
		}
		isPending = (ssp.dwCurrentState == SERVICE_START_PENDING) || 
						(ssp.dwCurrentState == SERVICE_STOP_PENDING) ||
						(ssp.dwCurrentState == SERVICE_CONTINUE_PENDING) || 
						(ssp.dwCurrentState == SERVICE_PAUSE_PENDING);
	}

	if(pdwStatus)
	{
		*pdwStatus = ssp.dwCurrentState;
	}

	CloseServiceHandle(hScm);
	CloseServiceHandle(hService);
	return cnt >= waitSec ? ERROR_TIMEOUT : 0;
}

void UpdateServiceStatusIcon(HINSTANCE hInstance, HWND hWnd)
{
	// Open the service control manager on local computer w/all access
	SC_HANDLE hScm = OpenSCManager( NULL, NULL, STANDARD_RIGHTS_REQUIRED | SC_MANAGER_CONNECT);
	if (hScm == NULL) {
		SetTrayIcon(NULL, hWnd, IDI_ERROR);
		return;
	}

	// Open Pion Service
	SC_HANDLE hService = OpenService(hScm, strPionServiceName, 
		STANDARD_RIGHTS_REQUIRED | SERVICE_STOP | SERVICE_QUERY_STATUS );  
 	if (hService == NULL) {
		CloseServiceHandle(hScm);
		SetTrayIcon(NULL, hWnd, IDI_ERROR);
		return;
	}

	DWORD dwBytesNeeded = 0;
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
	// query the service status
	if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
		(LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		SetTrayIcon(NULL, hWnd, IDI_ERROR);
		return;
	}

	LPCTSTR lpszIcon = IDI_QUESTION;
	switch(ssp.dwCurrentState) 
	{
	case SERVICE_STOPPED:
		lpszIcon = MAKEINTRESOURCE(IDI_STOPPED);
		break;
	case SERVICE_RUNNING:
		lpszIcon = MAKEINTRESOURCE(IDI_RUNNING);
		break;
	case SERVICE_START_PENDING:
	case SERVICE_STOP_PENDING:
		lpszIcon = MAKEINTRESOURCE(IDI_WAITING);
		break;
	default:
		hInstance = NULL; // system icon
		lpszIcon = IDI_QUESTION;
		break;
	}

	SetTrayIcon(hInstance, hWnd, lpszIcon);
	CloseServiceHandle(hScm);
	CloseServiceHandle(hService);
}