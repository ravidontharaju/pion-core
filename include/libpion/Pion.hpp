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

#ifndef __PION_PION_HEADER__
#define __PION_PION_HEADER__

#include <libpion/PionConfig.hpp>
#include <libpion/PionEngine.hpp>


namespace pion {	// begin namespace pion

///
/// Pion: library wrapper for the PionEngine singleton
/// 
namespace Pion {

	/**
	 * Adds a new TCP server
	 * 
	 * @param tcp_server the TCP server to add
	 * 
     * @return true if the server was added; false if a conflict occurred
	 */
	inline static bool addServer(TCPServerPtr tcp_server) {
		return PionEngine::getInstance().addServer(tcp_server);
	}
	
	/**
	 * Adds a new HTTP server
	 * 
	 * @param tcp_port the TCP port the server listens to
	 * 
     * @return pointer to the new server (pointer is undefined if failure)
	 */
	inline static HTTPServerPtr addHTTPServer(const unsigned int tcp_port) {
		return PionEngine::getInstance().addHTTPServer(tcp_port);
	}
	
	/**
	 * Retrieves an existing TCP server for the given port number
	 * 
	 * @param tcp_port the TCP port the server listens to
	 * 
     * @return pointer to the new server (pointer is undefined if failure)
	 */
	inline static TCPServerPtr getServer(const unsigned int tcp_port) {
		return PionEngine::getInstance().getServer(tcp_port);
	}
	
	/// starts pion
	inline static void start(void) {
		PionEngine::getInstance().start();
	}

	/// stops pion
	inline static void stop(void) {
		PionEngine::getInstance().stop();
	}

	/// the calling thread will sleep until the engine has stopped
	inline static void join(void) {
		PionEngine::getInstance().join();
	}
	
	/// sets the number of threads to be used (these are shared by all servers)
	inline static void setNumThreads(const unsigned int n) {
		PionEngine::getInstance().setNumThreads(n);
	}

	/// returns the number of threads currently in use
	inline static unsigned int getNumThreads(void) {
		return PionEngine::getInstance().getNumThreads();
	}

	/// sets the logger to be used
	inline static void setLogger(PionLogger log_ptr) {
		PionEngine::getInstance().setLogger(log_ptr);
	}

	/// returns the logger currently in use
	inline static PionLogger getLogger(void) {
		return PionEngine::getInstance().getLogger();
	}

}	// end namespace Pion

}	// end namespace pion

#endif
