// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Pion is free software: you can redistribute it and/or modify it under the
// terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option)
// any later version.
//
// Pion is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for
// more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Pion.  If not, see <http://www.gnu.org/licenses/>.
//

#ifndef __PION_MONITORSERVICE_HEADER__
#define __PION_MONITORSERVICE_HEADER__

#include <string>
#include <boost/enable_shared_from_this.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/circular_buffer.hpp>
#include <boost/thread/mutex.hpp>
#include <pion/PionConfig.hpp>
#include <pion/PionLogger.hpp>
#include <pion/net/TCPStream.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include "PlatformService.hpp"


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// MonitorHandler: base helper class for sending and receiving Events
///
class MonitorHandler
{
public:

	/// virtual destructor
	virtual ~MonitorHandler() { }
	
	/**
	 * constructs a new MonitorHandler object
	 *
	 * @param reaction_engine reference to the ReactionEngine
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 */
	MonitorHandler(pion::platform::ReactionEngine &reaction_engine,
				const std::string& reactor_id);
	
	/// starts the MonitorHandler
	virtual void start(void) = 0;
	
	/**
	 * sends an HTTP response over the TCP connection
	 *
	 * @return true if the response was sent successfully, or false if not
	 */
	bool sendResponse(void);
	
	/// returns the unique identifier for this particular connection
	inline const std::string& getConnectionId(void) const { return m_connection_id; }
	
	/// returns information describing this particular connection
	inline const std::string& getConnectionInfo(void) const { return m_connection_info; }
	
	/// returns the unique identifier for the Reactor that this handler interacts with
	inline const std::string& getReactorId(void) const { return m_reactor_id; }

	
protected:
	
	/// reference to ReactionEngine used to send Events to Reactors
	pion::platform::ReactionEngine &	m_reaction_engine;
	
	/// primary logging interface used by this class
	PionLogger							m_logger;	

	/// unique identifier for this particular connection (generated when constructed)
	const std::string					m_connection_id;
	
	/// information describing this particular connection (generated when constructed)
	const std::string					m_connection_info;
	
	/// unique identifier for the Reactor that this handler interacts with
	const std::string					m_reactor_id;
	
	/// mutex used to protect the MonitorHandler's data
	mutable boost::mutex				m_mutex;	
};			

	
///
/// MonitorWriter: helper class, capturing packets, storing them into an array, streaming into XML
///
class MonitorWriter
	: public MonitorHandler,
	public boost::enable_shared_from_this<MonitorWriter>
{

	/// Circular buffer to capture scrolling window of events
	boost::circular_buffer<pion::platform::EventPtr> m_event_buffer;

	/// Size of scroll buffer
	unsigned							m_size;

	/// Scroll or Capture/Stop
	bool								m_scroll;

	const platform::Vocabulary &		m_v;

public:
	
	/// virtual destructor
	virtual ~MonitorWriter();

	/**
	 * constructs a new MonitorWriter object
	 *
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 * @param size size of circular buffer to use for capture
	 * @param scroll boolean, whether to use scroll or capture&stop
	 */
	MonitorWriter(pion::platform::ReactionEngine &reaction_engine, const platform::Vocabulary& v,
			   const std::string& reactor_id, unsigned size, bool scroll);
	
	/**
	 * sends an Event over the TCP connection and cleans up if the
	 * connection has closed since we last sent data
	 *
	 * @param e the Event to send over the TCPConnection
	 */
	void writeEvent(pion::platform::EventPtr& e);
	
	/// starts the MonitorWriter
	virtual void start(void);

	std::string getStatus(void);

};

/// data type used for MonitorWriter smart pointers
typedef boost::shared_ptr<MonitorWriter>	MonitorWriterPtr;


	
///
/// MonitorService: Platform WebService used to send and receive Event streams
///
class MonitorService
	: public pion::server::PlatformService
{
	MonitorWriterPtr	m_writer_ptr;

public:
	
	/// constructs a new MonitorService object
	MonitorService(void)
	{
	}
	
	/// virtual destructor
	virtual ~MonitorService() {}
	
	/**
	 * attempts to handle a new HTTP request
	 *
	 * @param request the new HTTP request to handle
	 * @param tcp_conn the TCP connection that has the new request
	 */
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn);
};

	
}	// end namespace plugins
}	// end namespace pion

#endif
