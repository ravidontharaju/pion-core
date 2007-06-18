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
#ifdef PION_WIN32
	#include <boost/thread.hpp>
	#include <ctime>
#else
	#include <signal.h>
#endif

using namespace std;
using namespace pion;


/// stops Pion when it receives signals
#ifdef PION_WIN32
BOOL WINAPI console_ctrl_handler(DWORD ctrl_type)
{
	switch(ctrl_type) {
		case CTRL_C_EVENT:
		case CTRL_BREAK_EVENT:
		case CTRL_CLOSE_EVENT:
		case CTRL_SHUTDOWN_EVENT:
			Pion::stop();
			return TRUE;
		default:
			return FALSE;
	}
}
void wait_for_shutdown(const unsigned int seconds)
{
	boost::xtime stop_time;
	stop_time.sec = time(NULL) + seconds;
	boost::thread::sleep(stop_time);
}
#else
void handle_signal(int sig)
{
	Pion::stop();
}
#endif


/// simple TCP server that just sends "Hello there!" to each connection
class HelloServer : public TCPServer {
public:
	HelloServer(const unsigned int tcp_port) : TCPServer(tcp_port) {}
	virtual ~HelloServer() {}
	virtual void handleConnection(TCPConnectionPtr& conn)
	{
		static const std::string HELLO_MESSAGE("Hello there!\r\n");
		boost::asio::async_write(conn->getSocket(),
								 boost::asio::buffer(HELLO_MESSAGE),
								 boost::bind(&TCPConnection::finish, conn));
	}
};



/// main control function
int main (int argc, char *argv[])
{
	static const unsigned int DEFAULT_PORT = 8080;

	// parse command line: determine port number
	unsigned int port = DEFAULT_PORT;
	if (argc == 2) {
		port = strtoul(argv[1], 0, 10);
		if (port == 0) port = DEFAULT_PORT;
	} else if (argc != 1) {
		std::cerr << "usage: PionServerTest [port]" << std::endl;
		return 1;
	}

	// setup signal handler
#ifdef PION_WIN32
	SetConsoleCtrlHandler(console_ctrl_handler, TRUE);
#else
	signal(SIGINT, handle_signal);
#endif

	// initialize log system (use simple configuration)
	PionLogger main_log(PION_GET_LOGGER("PionServerTest"));
	PionLogger pion_log(PION_GET_LOGGER("Pion"));
	PION_LOG_SETLEVEL_DEBUG(main_log);
	PION_LOG_SETLEVEL_DEBUG(pion_log);
	PION_LOG_CONFIG_BASIC;
	
	try {
		
		// create a new server to handle the Hello TCP protocol
		TCPServerPtr hello_server(new HelloServer(port));
		if (! Pion::addServer(hello_server)) {
			PION_LOG_FATAL(main_log, "Failed to add HelloServer on port " << port);
			return 1;
		}
	
		// startup pion
		Pion::start();
		
		// run until stopped
		Pion::join();

	} catch (std::exception& e) {
		PION_LOG_FATAL(main_log, e.what());
	}

#ifdef PION_WIN32
	// pause for 1 second to work-around crashes on Windows
	wait_for_shutdown(1);
#endif

	return 0;
}

