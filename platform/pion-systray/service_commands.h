#pragma once
#include "resource.h"

/** 
 * GetPionServiceStatus: Get the status of Pion service
 * @param status Service status code (SERVICE_STOPPED, etc) if the call succeeded; GetLastError() value otherwise
 * @return TRUE if the call succeeded, FALSE otherwise
 */
BOOL GetPionServiceStatus(DWORD& status);

/**
 * StartPionService: Sends SERVICE_START command to the Pion Windows Service using Service Control Manager API
 * @return 0 for success, GetLastError() restult otherwise
 */
DWORD StartPionService();

/**
 * StopPionService: Sends SERVICE_STOP command to the Pion Windows Service using Service Control Manager API
 * @return 0 for success, GetLastError() restult otherwise
 */
DWORD StopPionService();

/**
 * IsUserAdmin: returns TRUE if current user belongs to Administrators group, FALSE otherwise
 */
BOOL IsUserAdmin();

/**
 * UpdateServiceStatusIcon: queries Pion service state and sets the SysTray icon accordingly
 * Note: the SysTray icon must already exist
 */
void UpdateServiceStatusIcon(HINSTANCE hInstance, HWND hWnd);


/**
 * WaitForServiceControlOpFinish: wait waitSec number of seconds for the serive to 
 * come to Started/Stopped/Paused state
 */
DWORD WaitForServiceControlOpFinish(int waitSec, DWORD* pdwState);
