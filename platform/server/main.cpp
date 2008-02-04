// ------------------------------------------------------------------
// pion-platform: a C++ framework for building lightweight HTTP interfaces
// ------------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See accompanying file COPYING or copy at http://www.boost.org/LICENSE_1_0.txt
//

#include <iostream>
#include "PlatformConfig.hpp"
#include "../../net/utils/ShutdownManager.hpp"

using namespace std;
using namespace pion;
using namespace pion::net;
using namespace pion::platform;
using namespace pion::server;


/// displays an error message if the arguments are invalid
void argument_error(void)
{
	std::cerr << "usage:   pion [-c SERVICE_CONFIG_FILE]" << std::endl;
}


/// main control function
int main (int argc, char *argv[])
{
	// get platform config file
	std::string platform_config_file("/etc/pion/platform.xml");
	for (int argnum=1; argnum < argc; ++argnum) {
		if (argv[argnum][0] == '-') {
			if (argv[argnum][1] == 'c' && argv[argnum][2] == '\0' && argnum+1 < argc) {
				platform_config_file = argv[++argnum];
			} else {
				argument_error();
				return 1;
			}
		} else {
			argument_error();
			return 1;
		}
	}
	
	// setup signal handler
#ifdef PION_WIN32
	SetConsoleCtrlHandler(console_ctrl_handler, TRUE);
#else
	signal(SIGINT, handle_signal);
#endif
	
	// initialize log system (use simple configuration)
	PionLogger pion_log(PION_GET_LOGGER("pion"));
	PION_LOG_SETLEVEL_INFO(pion_log);
	PION_LOG_CONFIG_BASIC;
	
	try {
		// load the platform configuration
		PlatformConfig platform_cfg;
		platform_cfg.setConfigFile(platform_config_file);
		platform_cfg.openConfigFile();

		// wait for shutdown
		main_shutdown_manager.wait();
		
	} catch (std::exception& e) {
		PION_LOG_FATAL(pion_log, e.what());
	}

	return 0;
}
