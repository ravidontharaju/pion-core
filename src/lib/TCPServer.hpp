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

#ifndef __PION_TCPSERVER_HEADER__
#define __PION_TCPSERVER_HEADER__

#include "PionLogger.hpp"
#include "TCPConnection.hpp"
#include <boost/noncopyable.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/asio.hpp>
#include <set>


namespace pion {	// begin namespace pion

///
/// TCPServer: a multi-threaded, asynchronous TCP server
/// 
class TCPServer
	: private boost::noncopyable
{
public:

	/// default destructor
	virtual ~TCPServer() { if (m_is_listening) handleStopRequest(); }
	
	/// starts listening for new connections
	void start(void);

	/// stops listening for new connections
	void stop(void);

	/// returns tcp port number server listens for connections on
	inline unsigned int getPort(void) const { return m_tcp_port; }

	/// sets the logger to be used
	inline void setLogger(log4cxx::LoggerPtr log_ptr) { m_logger = log_ptr; }
	
	/// returns the logger currently in use
	inline log4cxx::LoggerPtr getLogger(void) { return m_logger; }
	

protected:
		
	/**
	 * protect constructor so that only derived objects may be created
	 * 
	 * @param tcp_port port number used to listen for new connections
	 */
	explicit TCPServer(const unsigned int tcp_port);
	
	/**
	 * handles a new TCP connection; derived classes SHOULD override this
	 * since the default behavior does nothing
	 * 
	 * @param tcp_conn the new TCP connection to handle
	 */
	virtual void handleConnection(TCPConnectionPtr& tcp_conn) {
		tcp_conn->finish();
	}

	
private:
		
	/// handles a request to stop the server
	void handleStopRequest(void);
	
	/// listens for a new connection
	void listen(void);

	/**
	 * handles new connections (checks if there was an accept error)
	 *
	 * @param tcp_conn the new TCP connection (if no error occurred)
	 * @param accept_error true if an error occurred while accepting connections
	 */
	void handleAccept(TCPConnectionPtr& tcp_conn,
					  const boost::asio::error& accept_error);

	/// This will be called by TCPConnection::finish() after a server has
	/// finished handling a connection.  If the keep_alive flag is true,
	/// it will call handleConnection(); otherwise, it will close the
	/// connection and remove it from the server's management pool
	void finishConnection(TCPConnectionPtr& tcp_conn);

	
	/// data type for a pool of TCP connections
	typedef std::set<TCPConnectionPtr>		ConnectionPool;

	/// primary logging interface used by this class
	log4cxx::LoggerPtr						m_logger;

	/// mutex to make class thread-safe
	boost::mutex							m_mutex;

	/// manages async TCP connections
	boost::asio::ip::tcp::acceptor			m_tcp_acceptor;

	/// pool of active connections associated with this server 
	ConnectionPool							m_conn_pool;

	/// tcp port number server listens for connections on
	const unsigned int						m_tcp_port;

	/// set to true when the server is listening for new connections
	bool									m_is_listening;
};


/// data type for a TCPServer pointer
typedef boost::shared_ptr<TCPServer>	TCPServerPtr;


}	// end namespace pion

#endif
