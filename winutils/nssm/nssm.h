#ifndef NSSM_H
#define NSSM_H

#define _WIN32_WINNT 0x0500
#define _CRT_SECURE_NO_WARNINGS
#include <stdarg.h>
#include <stdio.h>
#include <windows.h>
#include "event.h"
#include "registry.h"
#include "service.h"
#include "gui.h"

extern int console;
int str_equiv(const char *, const char *);

#define NSSM "nssm"
#define NSSM_VERSION "2.0_AL"
#define NSSM_DATE "2009-05-22"
#define NSSM_INSTALL "install"
#define NSSM_INSTALL2 "install2"
#define NSSM_INSTALLCONS "installcons"
#define NSSM_INSTALL2CONS "install2cons"
#define NSSM_REMOVE "remove"
#define NSSM_RUN "run"
#define NSSM_RUNCONS "runcons"

#endif
