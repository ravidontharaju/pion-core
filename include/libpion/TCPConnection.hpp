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

#ifndef __PION_TCPCONNECTION_HEADER__
#define __PION_TCPCONNECTION_HEADER__

#include <libpion/PionConfig.hpp>
#include <boost/noncopyable.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/asio.hpp>
#include <boost/function.hpp>
#include <string>

#ifdef PION_HAVE_SSL
	#include <boost/asio/ssl.hpp>
#endif


namespace pion {	// begin namespace pion

///
/// TCPConnection: represents a single tcp connection
/// 
class TCPConnection :
	public boost::enable_shared_from_this<TCPConnection>,
	private boost::noncopyable
{
public:

	/// data type for a function that handles TCP connection objects
	typedef boost::function1<void, boost::shared_ptr<TCPConnection> >	ConnectionHandler;
	
	/// data type for a socket connection
	typedef boost::asio::ip::tcp::socket	Socket;

#ifdef PION_HAVE_SSL
	/// data type for an SSL socket connection
	typedef boost::asio::ssl::stream<boost::asio::ip::tcp::socket>	SSLSocket;

	/// data type for SSL configuration context
	typedef boost::asio::ssl::context								SSLContext;
#else
	typedef Socket	SSLSocket;
	typedef int		SSLContext;
#endif

	
	/**
	 * creates new TCPConnection objects
	 *
	 * @param io_service asio service associated with the connection
	 * @param ssl_context asio ssl context associated with the connection
	 * @param ssl_flag if true then the connection will be encrypted using SSL 
	 * @param finished_handler function called when a server has finished
	 *                         handling	the connection
	 */
	static inline boost::shared_ptr<TCPConnection> create(boost::asio::io_service& io_service,
														  SSLContext& ssl_context,
														  const bool ssl_flag,
														  ConnectionHandler finished_handler)
	{
		return boost::shared_ptr<TCPConnection>(new TCPConnection(io_service, ssl_context,
																  ssl_flag, finished_handler));
	}

	/// virtual destructor
	virtual ~TCPConnection() { close(); }

	/// closes the tcp socket
	inline void close(void) {
#ifdef PION_HAVE_SSL
		if (getSSLFlag())
			m_ssl_socket.lowest_layer().close();
		else 
#endif
			m_tcp_socket.close();
	}

	/// This function must be called when a server has finished handling
	/// the connection
	inline void finish(void) { m_finished_handler(shared_from_this()); }

	/// returns true if the connection is encrypted using SSL
	inline bool getSSLFlag(void) const { return m_ssl_flag; }

	/// returns the socket associated with the TCP connection (non-SSL)
	inline Socket& getSocket(void) { return m_tcp_socket; }

	/// returns the socket associated with the TCP connection (SSL)
	inline SSLSocket& getSSLSocket(void) { return m_ssl_socket; }

	/// returns true if the connection should be kept alive
	inline bool getKeepAlive(void) const { return m_keep_alive; }
	
	/// sets the value of the keep_alive flag
	inline void setKeepAlive(bool b = true) { m_keep_alive = b; }

	
protected:
		
	/**
	 * protected constructor restricts creation of objects (use create())
	 *
	 * @param io_service asio service associated with the connection
	 * @param ssl_context asio ssl context associated with the connection
	 * @param ssl_flag if true then the connection will be encrypted using SSL 
	 * @param finished_handler function called when a server has finished
	 *                         handling	the connection
	 */
	TCPConnection(boost::asio::io_service& io_service,
				  SSLContext& ssl_context,
				  const bool ssl_flag,
				  ConnectionHandler finished_handler)
		: m_tcp_socket(io_service),
#ifdef PION_HAVE_SSL
		m_ssl_socket(io_service, ssl_context),
#else
		m_ssl_socket(io_service),
#endif
		m_ssl_flag(ssl_flag), m_keep_alive(false),
		m_finished_handler(finished_handler)
	{}
	

private:

	/// TCP connection socket
	Socket						m_tcp_socket;
	
	/// SSL connection socket
	SSLSocket					m_ssl_socket;

	/// true if the connection is encrypted using SSL
	const bool					m_ssl_flag;
	
	/// true if the connection should be kept alive
	bool						m_keep_alive;

	/// function called when a server has finished handling the connection
	ConnectionHandler			m_finished_handler;
};


/// data type for a TCPConnection pointer
typedef boost::shared_ptr<TCPConnection>	TCPConnectionPtr;


}	// end namespace pion

#endif
