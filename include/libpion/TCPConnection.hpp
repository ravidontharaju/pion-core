// -----------------------------------------------------------------
// libpion: a C++ framework for building lightweight HTTP interfaces
// -----------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See accompanying file COPYING or copy at http://www.boost.org/LICENSE_1_0.txt
//

#ifndef __PION_TCPCONNECTION_HEADER__
#define __PION_TCPCONNECTION_HEADER__

#ifdef PION_HAVE_SSL
	#include <boost/asio/ssl.hpp>
#endif

#include <boost/noncopyable.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/asio.hpp>
#include <boost/function.hpp>
#include <libpion/PionConfig.hpp>
#include <string>


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

	/// data type for the connection's lifecycle state
	enum LifecycleType {
		LIFECYCLE_CLOSE, LIFECYCLE_KEEPALIVE, LIFECYCLE_PIPELINED
	};

	
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

	/// sets the lifecycle type for the connection
	inline void setLifecycle(LifecycleType t) { m_lifecycle = t; }
	
	/// returns the lifecycle type for the connection
	inline bool getLifecycle(void) const { return m_lifecycle; }
	
	/// returns true if the connection should be kept alive
	inline bool getKeepAlive(void) const { return m_lifecycle != LIFECYCLE_CLOSE; }
	
	/// returns true if the HTTP requests are pipelined
	inline bool getPipelined(void) const { return m_lifecycle == LIFECYCLE_PIPELINED; }
	
	
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
		m_ssl_flag(ssl_flag), m_lifecycle(LIFECYCLE_CLOSE),
		m_finished_handler(finished_handler)
	{}
	

private:

	/// TCP connection socket
	Socket						m_tcp_socket;
	
	/// SSL connection socket
	SSLSocket					m_ssl_socket;

	/// true if the connection is encrypted using SSL
	const bool					m_ssl_flag;

	/// lifecycle state for the connection
	LifecycleType				m_lifecycle;

	/// function called when a server has finished handling the connection
	ConnectionHandler			m_finished_handler;
};


/// data type for a TCPConnection pointer
typedef boost::shared_ptr<TCPConnection>	TCPConnectionPtr;


}	// end namespace pion

#endif
