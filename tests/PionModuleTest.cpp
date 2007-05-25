// -----------------------------------------------------------------
// libpion: a C++ framework for building lightweight HTTP interfaces
// -----------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
//

#include <libpion/Pion.hpp>
#include <boost/bind.hpp>
#include <iostream>
#include <vector>
#include <signal.h>


using namespace std;
using namespace pion;


/// stops Pion when it receives signals
void handle_signal(int sig)
{
	Pion::stop();
}

/// displays an error message if the arguments are invalid
void argument_error(void)
{
	std::cerr << "usage: PionModuleTest [-p PORT] [-o OPTION=VALUE] RESOURCE MODULE" << std::endl;
}


/// main control function
int main (int argc, char *argv[])
{
	static const unsigned int DEFAULT_PORT = 8080;

	// used to keep track of module name=value options
	typedef std::vector<std::pair<std::string, std::string> >	ModuleOptionsType;
	ModuleOptionsType module_options;
	
	// parse command line: determine port number, RESOURCE and MODULE
	unsigned int port = DEFAULT_PORT;
	std::string resource_name;
	std::string module_name;
	
	for (int argnum=1; argnum < argc; ++argnum) {
		if (argv[argnum][0] == '-') {
			if (argv[argnum][1] == 'p' && argv[argnum][2] == '\0' && argnum+1 < argc) {
				++argnum;
				port = strtoul(argv[argnum], 0, 10);
				if (port == 0) port = DEFAULT_PORT;
			} else if (argv[argnum][1] == 'o' && argv[argnum][2] == '\0' && argnum+1 < argc) {
				std::string option_name(argv[++argnum]);
				std::string::size_type pos = option_name.find('=');
				if (pos == std::string::npos) {
					argument_error();
					return 1;
				}
				std::string option_value(option_name, pos + 1);
				option_name.resize(pos);
				module_options.push_back( std::make_pair(option_name, option_value) );
			} else {
				argument_error();
				return 1;
			}
		} else if (argnum+2 == argc) {
			// second to last argument = RESOURCE
			resource_name = argv[argnum];
		} else if (argnum+1 == argc) {
			// last argument = MODULE
			module_name = argv[argnum];
		} else {
			argument_error();
			return 1;
		}
	}
	
	if (resource_name.empty() || module_name.empty()) {
		argument_error();
		return 1;
	}
	
	// setup signal handlers
	signal(SIGINT, handle_signal);

	// initialize log system (use simple configuration)
	PionLogger main_log(PION_GET_LOGGER("Pion"));
	PION_LOG_SETLEVEL_DEBUG(main_log);
	PION_LOG_CONFIG_BASIC;
	
	try {
		// add the modules installation directory to our path
		try { Pion::addPluginDirectory(PION_MODULES_DIRECTORY); }
		catch (PionPlugin::DirectoryNotFoundException&) {
			PION_LOG_WARN(main_log, "Default modules directory does not exist: "
				<< PION_MODULES_DIRECTORY);
		}

		// create a server for HTTP & add the Hello module
		HTTPServerPtr http_server(Pion::addHTTPServer(port));
		http_server->loadModule(resource_name, module_name);
		
		// set module options if any are defined
		for (ModuleOptionsType::iterator i = module_options.begin();
			 i != module_options.end(); ++i)
		{
			http_server->setModuleOption(resource_name, i->first, i->second);
		}
	
		// startup pion
		Pion::start();
	
		// run until stopped
		Pion::join();
		
	} catch (std::exception& e) {
		PION_LOG_FATAL(main_log, "Caught exception in main(): " << e.what());
	}

	return 0;
}

