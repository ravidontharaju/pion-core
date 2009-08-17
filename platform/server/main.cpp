// ------------------------------------------------------------------
// pion-platform: a C++ framework for building lightweight HTTP interfaces
// ------------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See accompanying file COPYING or copy at http://www.boost.org/LICENSE_1_0.txt
//

#ifndef _MSC_VER
	#include <fcntl.h>
	#include <unistd.h>
	#include <sys/stat.h>
#endif

// mlockall support on LINUX
#ifndef _MSC_VER
	#include <sys/mman.h>
	#include <string.h>
#endif

#ifdef PION_HAVE_SSL
	#include <openssl/ssl.h>
#ifdef _MSC_VER
	#include <openssl/applink.c>
#endif
#endif

#include <iostream>
#include <boost/filesystem/operations.hpp>
#include "PlatformConfig.hpp"
#include "../../net/utils/ShutdownManager.hpp"

using namespace std;
using namespace pion;
using namespace pion::net;
using namespace pion::platform;
using namespace pion::server;


// some forward declarations of functions used by main()
void daemonize_server(void);
void argument_error(void);


/// main control function
int main (int argc, char *argv[])
{
	// get platform config file
	bool run_as_daemon = false;
	bool lock_memory = false;
	std::string platform_config_file("/etc/pion/platform.xml");
	for (int argnum=1; argnum < argc; ++argnum) {
		if (argv[argnum][0] == '-') {
			if (argv[argnum][1] == 'D') {
				run_as_daemon = true;
			} else if (argv[argnum][1] == 'M') {
				lock_memory = true;
			} else if (argv[argnum][1] == 'c' && argv[argnum][2] == '\0' && argnum+1 < argc) {
				platform_config_file = boost::filesystem::system_complete(argv[++argnum]).normalize().file_string();
			} else if (strncmp(argv[argnum], "--version", 9) == 0) {
				std::cout << "pion version " << PION_VERSION << std::endl;
				return 0;
			} else {
				argument_error();
				return 1;
			}
		} else {
			argument_error();
			return 1;
		}
	}
	
	/// become a daemon if the -D option is given
	if (run_as_daemon)
		daemonize_server();
	
	// setup signal handler
#ifdef PION_WIN32
	SetConsoleCtrlHandler(console_ctrl_handler, TRUE);
#else
	signal(SIGPIPE, SIG_IGN);
	signal(SIGCHLD, SIG_IGN);
	signal(SIGTSTP, SIG_IGN);
	signal(SIGTTOU, SIG_IGN);
	signal(SIGTTIN, SIG_IGN);
	signal(SIGHUP, SIG_IGN);
	signal(SIGINT, handle_signal);
	signal(SIGTERM, handle_signal);
#endif
	
	// initialize log system (use simple configuration)
	PionLogger pion_log(PION_GET_LOGGER("pion"));

	// This level might be overridden if there is a LogConfig file specified in the platform 
	// configuration (and if using a logging library that supports logging configuration.)
	PION_LOG_SETLEVEL_INFO(pion_log);

	PION_LOG_CONFIG_BASIC;
	
#ifdef PION_HAVE_SSL
	// initialize the OpenSSL library
	CRYPTO_malloc_init();
	SSL_library_init();
#endif

#ifndef _MSC_VER
	if (lock_memory)
		if (mlockall(MCL_CURRENT | MCL_FUTURE))
			PION_LOG_FATAL(pion_log, "Failed to lock memory: " << strerror(errno));
#endif

	PlatformConfig platform_cfg;
	try {
		// load the platform configuration
		platform_cfg.setConfigFile(platform_config_file);
		platform_cfg.openConfigFile();
		
		PION_LOG_INFO(pion_log, "Pion has started successfully (v" << PION_VERSION << ')');

		// wait for shutdown
		main_shutdown_manager.wait();
		
	} catch (std::exception& e) {
		PION_LOG_FATAL(pion_log, e.what());
	}

	PION_LOG_INFO(pion_log, "Pion is shutting down");
	
	return 0;
}


/// run server as a daemon
void daemonize_server(void)
{
#ifndef _MSC_VER
	// adopted from "Unix Daemon Server Programming"
	// http://www.enderunix.org/docs/eng/daemon.php
	
	// return early if already running as a daemon
	if(getppid()==1) return;
	
	// for out the process 
	int i = fork();
	if (i<0) exit(1);	// error forking
	if (i>0) exit(0);	// exit if parent
	
	// child (daemon process) continues here after the fork...
	
	// obtain a new process group
	setsid();
	
	// close all descriptors
	for (i=getdtablesize();i>=0;--i) close(i);
	
	// bind stdio to /dev/null
	i=open("/dev/null",O_RDWR); dup(i); dup(i);
	
	// restrict file creation mode to 0750
	umask(027);
#endif
}


/// displays an error message if the arguments are invalid
void argument_error(void)
{
	std::cerr << "usage:   pion [-c SERVICE_CONFIG_FILE] [-D]" << std::endl;
}
