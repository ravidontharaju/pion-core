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

// pion headers
#include <TCPServer.hpp>
#include <PionEngine.hpp>
// other headers
#include <boost/bind.hpp>

using boost::asio::ip::tcp;


namespace pion {	// begin namespace pion

// TCPServer member functions

TCPServer::TCPServer(const unsigned int tcp_port)
	: m_logger(log4cxx::Logger::getLogger("Pion.TCPServer")),
	m_tcp_acceptor(PionEngine::getInstance().getIOService()),
	m_tcp_port(tcp_port), m_is_listening(false)
{}

void TCPServer::start(void)
{
	// lock mutex for thread safety
	boost::mutex::scoped_lock server_lock(m_mutex);

	if (! m_is_listening) {
		LOG4CXX_INFO(m_logger, "Starting server on port " << getPort());

		// configure the acceptor service
		tcp::endpoint endpoint(tcp::v4(), m_tcp_port);
		m_tcp_acceptor.open(endpoint.protocol());
		// allow the acceptor to reuse the address (i.e. SO_REUSEADDR)
		m_tcp_acceptor.set_option(tcp::acceptor::reuse_address(true));
		m_tcp_acceptor.bind(endpoint);
		m_tcp_acceptor.listen();

		m_is_listening = true;

		// unlock the mutex since listen() requires its own lock
		server_lock.unlock();
		listen();
	}
}

void TCPServer::stop(void)
{
	// lock mutex for thread safety
	boost::mutex::scoped_lock server_lock(m_mutex);

	if (m_is_listening) {
		// schedule stop request with io_service to finish any pending events
		// this allows any pending I/O events to finish processing first
		m_tcp_acceptor.io_service().post(boost::bind(&TCPServer::handleStopRequest, this));
	}
}

void TCPServer::handleStopRequest(void)
{
	// lock mutex for thread safety
	boost::mutex::scoped_lock server_lock(m_mutex);

	if (m_is_listening) {
		LOG4CXX_INFO(m_logger, "Shutting down server on port " << getPort());
	
		m_is_listening = false;

		// this terminates any pending connections
		m_tcp_acceptor.close();
	
		// close all of the TCP connections managed by this server instance
		std::for_each(m_conn_pool.begin(), m_conn_pool.end(),
					  boost::bind(&TCPConnection::close, _1));

		// clear the TCP connection management pool
		m_conn_pool.clear();
	}
}

void TCPServer::listen(void)
{
	// lock mutex for thread safety
	boost::mutex::scoped_lock server_lock(m_mutex);
	
	if (m_is_listening) {
		// create a new TCP connection object
		TCPConnectionPtr new_connection(TCPConnection::create(m_tcp_acceptor.io_service(),
															  boost::bind(&TCPServer::finishConnection,
																		  this, _1)));
		m_conn_pool.insert(new_connection);
		
		// use the new object to accept a connection
		m_tcp_acceptor.async_accept(new_connection->getSocket(),
									boost::bind(&TCPServer::handleAccept,
												this, new_connection,
												boost::asio::placeholders::error) );
	}
}

void TCPServer::handleAccept(TCPConnectionPtr& tcp_conn, const boost::asio::error& accept_error)
{
	if (accept_error) {
		// an error occured while trying to a accept a new connection
		// this happens when the server is being shut down
		finishConnection(tcp_conn);
	} else {
		// got a new TCP connection
		LOG4CXX_INFO(m_logger, "New connection on port " << getPort());
		// schedule the acceptance of another new connection
		// (this returns immediately since it schedules it as an event)
		if (m_is_listening) listen();
		// handle the new connection
		handleConnection(tcp_conn);
	}
}

void TCPServer::finishConnection(TCPConnectionPtr& tcp_conn)
{
	if (tcp_conn->getKeepAlive()) {
		
		// keep the connection alive
		handleConnection(tcp_conn);

	} else {
		LOG4CXX_INFO(m_logger, "Closing connection on port " << getPort());
		
		// remove the connection from the server's management pool
		boost::mutex::scoped_lock server_lock(m_mutex);
		m_conn_pool.erase(tcp_conn);
		server_lock.unlock();
	}
}

}	// end namespace pion
