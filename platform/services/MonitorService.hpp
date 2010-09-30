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
#include <iosfwd>
#include <boost/enable_shared_from_this.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/circular_buffer.hpp>
#include <boost/thread/mutex.hpp>
#include <boost/unordered_map.hpp>
#include <pion/net/HTTPTypes.hpp>
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
private:

	/// Circular buffer to capture scrolling window of events
	boost::circular_buffer<pion::platform::EventPtr> m_event_buffer;

	/// Size of scroll buffer
	unsigned							m_size;

	/// Scroll or Capture/Stop
	bool								m_scroll;

	/// copy of the universal Term Vocabular
	platform::VocabularyPtr				m_vocab_ptr;

	/// Age (either created, or last accessed) for expiration
	unsigned							m_age;
	
	/// At what length to truncate strings
	unsigned							m_truncate;

	/// Is the MonitorWriter still collecting events?
	bool								m_stopped;

	/// HideAll is an opt-in mode
	bool								m_hide_all;

	/// Which terms to show in opt-in mode
	std::set<pion::platform::Vocabulary::TermRef>		m_show_terms;

	/// Reference to ReactionEngine, so it can disconnect
	pion::platform::ReactionEngine &	m_reaction_engine;

	/// Suppressed termref's
	std::set<pion::platform::Vocabulary::TermRef>		m_suppressed_terms;

public:
	
	typedef boost::unordered_map<pion::platform::Vocabulary::TermRef, unsigned> TermCol;
	
	/// virtual destructor
	virtual ~MonitorWriter();

	/**
	 * constructs a new MonitorWriter object
	 *
	 * @param reactor_id unique identifier for the Reactor that this handler interacts with
	 * @param size size of circular buffer to use for capture
	 * @param scroll boolean, whether to use scroll or capture&stop
	 */
	MonitorWriter(pion::platform::ReactionEngine &reaction_engine, platform::VocabularyPtr& vptr,
			   const std::string& reactor_id, unsigned size, bool scroll);
	
	/**
	 * sends an Event over the TCP connection and cleans up if the
	 * connection has closed since we last sent data
	 *
	 * @param e the Event to send over the TCPConnection
	 */
	void writeEvent(pion::platform::EventPtr& e);

	/// "set method" for MonitorWriters parameters from query parameters
	void setQP(const pion::net::HTTPTypes::QueryParams& qp);
	
	/// starts the MonitorWriter
	virtual void start(const pion::net::HTTPTypes::QueryParams& qp);

	/// stop MonitorWriter from collecting more data
	void stop(void) {
		m_reaction_engine.post(boost::bind(&pion::platform::ReactionEngine::removeTempConnection,
										   &m_reaction_engine, getConnectionId()));
		m_stopped = true;
	}

	/**
	 * serializes event Terms to an XML output stream
	 * (for use by Event::for_each)
	 *
	 * @param tref ParameterNode TermRef
	 * @param value ParameterNode ParameterValue
	 * @param xml output stream
	 */
	void SerializeXML(pion::platform::Vocabulary::TermRef tref,
		const pion::platform::Event::ParameterValue& value,
		std::ostream& xml, TermCol& cols) const;

	std::string getStatus(const pion::net::HTTPTypes::QueryParams& qp);
};

/// data type used for MonitorWriter smart pointers
typedef boost::shared_ptr<MonitorWriter>	MonitorWriterPtr;


	
///
/// MonitorService: Platform WebService used to send and receive Event streams
///
class MonitorService
	: public pion::server::PlatformService
{
	/// A vector of currently active MonitorWriters
	std::vector<MonitorWriterPtr>	m_writers;

public:
	
	/// constructs a new MonitorService object
	MonitorService(void)
		: m_writers(10)		// a default of ten simultaneous monitors allowed
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

	/// returns the type attribute used for an XML Permission node pertaining to MonitorService
	std::string getPermissionType(void) const { return MONITOR_SERVICE_PERMISSION_TYPE; }

private:

	static const std::string			MONITOR_SERVICE_PERMISSION_TYPE;
};

	
}	// end namespace plugins
}	// end namespace pion

#endif
