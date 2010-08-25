// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2010 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#include <sstream>
#include <boost/bind.hpp>
#include <pion/PionId.hpp>
#include <pion/net/HTTPResponse.hpp>
#include <pion/net/HTTPResponseWriter.hpp>
//#include <boost/intrusive/rbtree_algorithms.hpp>
#include "pion/platform/Event.hpp"
#include "PlatformConfig.hpp"
#include "MonitorService.hpp"

using namespace pion::net;
using namespace pion::server;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// MonitorHandler member functions
	
MonitorHandler::MonitorHandler(pion::platform::ReactionEngine &reaction_engine,
						 const std::string& reactor_id)
	: m_reaction_engine(reaction_engine),
	m_logger(PION_GET_LOGGER("pion.server.MonitorHandler")),
	m_connection_id(PionId().to_string()),
	m_reactor_id(reactor_id)
{}

bool MonitorHandler::sendResponse(void)
{
	// build some XML response content for the request
	std::stringstream ss;
	m_reaction_engine.writeConnectionsXML(ss, getConnectionId());
	return true;
}
	
// MonitorWriter member functions

MonitorWriter::MonitorWriter(pion::platform::ReactionEngine &reaction_engine, platform::VocabularyPtr& vptr,
					   const std::string& reactor_id, unsigned size, bool scroll)
	: MonitorHandler(reaction_engine, reactor_id),
	m_event_buffer(size), m_size(size), m_scroll(scroll), m_vocab_ptr(vptr)
{}
	
MonitorWriter::~MonitorWriter()
{
	PION_LOG_INFO(m_logger, "Closing output feed to " << getConnectionInfo()
				  << " (" << getConnectionId() << ')');
}
	
void MonitorWriter::writeEvent(EventPtr& e)
{
	PION_LOG_DEBUG(m_logger, "Sending event to " << getConnectionInfo()
				   << " (" << getConnectionId() << ')');
	// lock the mutex to ensure that only one Event is sent at a time
	boost::mutex::scoped_lock send_lock(m_mutex);
	if (e.get() == NULL) {
		// Reactor is being removed -> close the connection
//		m_tcp_stream.close();
		// note that the ReactionEngine will remove the connection for us
	} else if (false) { // (!m_tcp_stream || !m_tcp_conn->is_open()) {
		PION_LOG_DEBUG(m_logger, "Lost connection to " << getConnectionInfo()
					  << " (" << getConnectionId() << ')');
		// connection was lost -> tell ReactionEngine to remove the connection
		m_reaction_engine.post(boost::bind(&ReactionEngine::removeTempConnection,
										   &m_reaction_engine, getConnectionId()));
	} else {
		try {
			// Add latest event to end of circular buffer
			m_event_buffer.push_back(e);

			// If we're not scrolling, and buffer is full, then disconnect from the feed
			if (!m_scroll && m_event_buffer.full())
				m_reaction_engine.post(boost::bind(&ReactionEngine::removeTempConnection,
											   &m_reaction_engine, getConnectionId()));
		} catch (std::exception& ex) {
			// stop sending Events if we encounter an exception
			PION_LOG_WARN(m_logger, "Error sending event to " << getConnectionInfo()
						  << " (" << getConnectionId() << "):" << ex.what());
			m_reaction_engine.post(boost::bind(&ReactionEngine::removeTempConnection,
											   &m_reaction_engine, getConnectionId()));
		}
	}
}
	
void MonitorWriter::start(void)
{
	// lock the mutex to ensure that the HTTP response is sent first
	boost::mutex::scoped_lock send_lock(m_mutex);

	// tell the ReactionEngine to start sending us Events
	Reactor::EventHandler event_handler(boost::bind(&MonitorWriter::writeEvent,
													shared_from_this(), _1));
	m_reaction_engine.addTempConnectionOut(getReactorId(), getConnectionId(),
										   getConnectionInfo(),
										   event_handler);

	// send the HTTP response after the connection is successfully created
	if (! sendResponse())
		return;
	
	PION_LOG_INFO(m_logger, "Opened new output feed to " << getConnectionInfo()
				  << " (" << getConnectionId() << ')');
}

void MonitorWriter::SerializeXML(pion::platform::Vocabulary::TermRef tref,
	const pion::platform::Event::ParameterValue& value, std::ostream& xml) const
{
	if (tref > m_vocab_ptr->size())		// sanity check
		tref = Vocabulary::UNDEFINED_TERM_REF;
	const Vocabulary::Term& t((*m_vocab_ptr)[tref]);	// term corresponding with Event parameter
	std::string tmp;		// tmp storage for values
	xml << "<Term id=\"" << t.term_id << "\">"
		<< ConfigManager::xml_encode(Event::write(tmp, value, t))
		<< "</Term>";
}

std::string MonitorWriter::getStatus(void)
{
	// traverse through all events in buffer
	std::ostringstream xml("<Events>");
	for (boost::circular_buffer<pion::platform::EventPtr>::const_iterator i = m_event_buffer.begin(); i != m_event_buffer.end(); i++) {
		// traverse through all terms in event
		xml << "<Event>";
		(*i)->for_each(boost::bind(&MonitorWriter::SerializeXML,
			this, _1, _2, boost::ref(xml)));
		xml << "</Event>";
	}
	xml << "</Events>";
	return xml.str();
}


// MonitorService member functions

void MonitorService::operator()(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// split out the path branches from the HTTP request
	PathBranches branches;
	splitPathBranches(branches, request->getResource());
	
	// make sure that there are two extra path branches in the request
	if (branches.size() < 2) {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}
	
	// get the reactor_id from the first path branch
	const std::string reactor_id(branches[0]);
	if (reactor_id.empty() || !getConfig().getReactionEngine().hasPlugin(reactor_id)) {
		HTTPServer::handleNotFoundRequest(request, tcp_conn);
		return;
	}
	
	// get the start/stop verb
	const std::string verb(branches[1]);
	
	// check the request method to determine if we should read or write Events
	if (request->getMethod() == HTTPTypes::REQUEST_METHOD_GET) {

		// request made to receive a stream of Events
		if (verb == "status") {
			// use local array to identify the reactor_id
			// possibly a secondary id, for multiple instances per reactor_id
			// get the status for this capture...
			std::string response = m_writer_ptr->getStatus();
			HTTPResponseWriterPtr response_writer(HTTPResponseWriter::create(tcp_conn, *request,
											  boost::bind(&TCPConnection::finish, tcp_conn)));
			response_writer->write(response);
		} else if (verb == "start") {
			VocabularyPtr vocab_ptr(getConfig().getReactionEngine().getVocabulary());
			// create a MonitorWriter object that will be used to send Events
			m_writer_ptr.reset(new MonitorWriter(getConfig().getReactionEngine(), vocab_ptr, reactor_id, 1000, true));
			m_writer_ptr->start();
		} else if (verb == "stop") {
		} else if (verb == "delete") {
		}
		
	} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_PUT
			   || request->getMethod() == HTTPTypes::REQUEST_METHOD_POST)
	{

		// Error message? Not supported...

	} else if (request->getMethod() == HTTPTypes::REQUEST_METHOD_HEAD) {
		
		// request is just checking if the reactor is valid -> return OK
		HTTPResponseWriterPtr response_writer(HTTPResponseWriter::create(tcp_conn, *request,
											  boost::bind(&TCPConnection::finish, tcp_conn)));
		response_writer->send();
	}	
}

}	// end namespace plugins
}	// end namespace pion


/// creates new MonitorService objects
extern "C" PION_PLUGIN_API pion::server::PlatformService *pion_create_MonitorService(void) {
	return new pion::plugins::MonitorService();
}

/// destroys MonitorService objects
extern "C" PION_PLUGIN_API void pion_destroy_MonitorService(pion::plugins::MonitorService *service_ptr) {
	delete service_ptr;
}
