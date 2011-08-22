#include "stdafx.h"
#include "service_commands.h"

static LPCTSTR strPionServiceName = _T("pion");
static DWORD dwSCTimeout = 20000; // 20 sec timeout for service commands

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

     // Set the cursor to an hourglass.
	HCURSOR hCurs = SetCursor(LoadCursor(NULL,IDC_WAIT));

	// send the Stop command
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
    if (!StartService( hService, 0, NULL)) {
        rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		SetCursor(hCurs);
		return rc;
    }

	DWORD dwBytesNeeded = 0;
	// query the service status
	if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
		(LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
		rc = GetLastError();
		SetCursor(hCurs);
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		return rc;
	}

	// wait for the service to come to the SERVICE_STOPPED state
	while (ssp.dwCurrentState != SERVICE_RUNNING) {
		DWORD dwWait = ssp.dwWaitHint / 10;
		if (dwWait < 1000) {
			dwWait = 1000;
		} else if(dwWait > 10000) {
			dwWait = 10000;
		}

		// check for timeout
		if(GetTickCount() - dwStartTime > dwSCTimeout ) {
			rc = WAIT_TIMEOUT;
			SetCursor(hCurs);
			CloseServiceHandle(hScm);
			CloseServiceHandle(hService);
			return rc;
		}

		Sleep(dwWait);

		// query the service status
        if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
                 (LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
			rc = GetLastError();
			SetCursor(hCurs);
			CloseServiceHandle(hScm);
			CloseServiceHandle(hService);
			return rc;
        }
	}

	SetCursor(hCurs);
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

     // Set the cursor to an hourglass.
	HCURSOR hCurs = SetCursor(LoadCursor(NULL,IDC_WAIT));

	// send the Stop command
	SERVICE_STATUS_PROCESS ssp;
	ZeroMemory(&ssp, sizeof(ssp));
    if (!ControlService( hService, SERVICE_CONTROL_STOP, (LPSERVICE_STATUS) &ssp)) {
        rc = GetLastError();
		CloseServiceHandle(hScm);
		CloseServiceHandle(hService);
		SetCursor(hCurs);
		return rc;
    }

	// wait for the service to come to the SERVICE_STOPPED state
	while (ssp.dwCurrentState != SERVICE_STOPPED) {
		DWORD dwWait = ssp.dwWaitHint / 10;
		if (dwWait < 1000) {
			dwWait = 1000;
		} else if(dwWait > 10000) {
			dwWait = 10000;
		}

		// check for timeout
		if(GetTickCount() - dwStartTime > dwSCTimeout ) {
			rc = WAIT_TIMEOUT;
			SetCursor(hCurs);
			CloseServiceHandle(hScm);
			CloseServiceHandle(hService);
			return rc;
		}

		Sleep(dwWait);

		DWORD dwBytesNeeded = 0;
		// query the service status
        if (!QueryServiceStatusEx( hService, SC_STATUS_PROCESS_INFO,
                 (LPBYTE)&ssp, sizeof(ssp), &dwBytesNeeded )) {
			rc = GetLastError();
			SetCursor(hCurs);
			CloseServiceHandle(hScm);
			CloseServiceHandle(hService);
			return rc;
        }
	}

	SetCursor(hCurs);
	CloseServiceHandle(hScm);
	CloseServiceHandle(hService);

	return 0;
}
