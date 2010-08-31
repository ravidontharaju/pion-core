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
#include "pion/platform/Event.hpp"
#include "PlatformConfig.hpp"
#include "MonitorService.hpp"

using namespace pion::net;
using namespace pion::server;
using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins

const std::string dtd = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

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
	m_event_buffer(size), m_size(size), m_scroll(scroll), m_vocab_ptr(vptr), m_truncate(100), m_stopped(false),
	m_reaction_engine(reaction_engine)
{}
	
MonitorWriter::~MonitorWriter()
{
	PION_LOG_INFO(m_logger, "Closing output feed to " << getConnectionInfo()
				  << " (" << getConnectionId() << ')');
	stop();
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
		stop();
	} else {
		try {
			// Add latest event to end of circular buffer
			m_event_buffer.push_back(e);

			// If we're not scrolling, and buffer is full, then disconnect from the feed
			if (!m_scroll && m_event_buffer.full())
				stop();
		} catch (std::exception& ex) {
			// stop sending Events if we encounter an exception
			PION_LOG_WARN(m_logger, "Error sending event to " << getConnectionInfo()
						  << " (" << getConnectionId() << "):" << ex.what());
			stop();
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
	const pion::platform::Event::ParameterValue& value, std::ostream& xml, TermCol& cols) const
{
	if (tref > m_vocab_ptr->size())		// sanity check
		tref = Vocabulary::UNDEFINED_TERM_REF;
	const Vocabulary::Term& t((*m_vocab_ptr)[tref]);	// term corresponding with Event parameter
	// Have we seen this tref (column) yet?
	TermCol::iterator i = cols.find(tref);
	if (i == cols.end()) {
		cols[tref] = cols.size();
		i = cols.find(tref);
	}
	// Don't serialize the non-serializable
	if (t.term_type == Vocabulary::TYPE_NULL || t.term_type == Vocabulary::TYPE_OBJECT)
		xml << "<Term id=\"C" << i->second << "\"\\>";
	else {
		std::string tmp;		// tmp storage for values
		xml << "<Term id=\"C" << i->second << "\">"
			<< ConfigManager::xml_encode(Event::write(tmp, value, t).substr(0, m_truncate))
			<< "</Term>";
	}
}

std::string MonitorWriter::getStatus(void)
{
	// Map for termref -> Cnn index, we'll use it for building the guide
	TermCol col_map;

	// traverse through all events in buffer
	std::ostringstream xml("<Events>");
	for (boost::circular_buffer<pion::platform::EventPtr>::const_iterator i = m_event_buffer.begin(); i != m_event_buffer.end(); i++) {
		// traverse through all terms in event
		xml << "<Event>";
		(*i)->for_each(boost::bind(&MonitorWriter::SerializeXML,
			this, _1, _2, boost::ref(xml), boost::ref(col_map)));
		xml << "</Event>";
	}
	xml << "</Events>";
	std::ostringstream prefix("<Columns>");
	for (TermCol::const_iterator i = col_map.begin(); i != col_map.end(); i++) {
		const Vocabulary::Term& t((*m_vocab_ptr)[i->first]);
		prefix << "<Column id=\"C" << i->second << "\">" << t.term_id << "</Column>";
	}
	prefix << "</Columns>";
	return "<Status>" + prefix.str() + xml.str() + "</Status>";
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

		HTTPResponseWriterPtr response_writer(HTTPResponseWriter::create(tcp_conn, *request,
										  boost::bind(&TCPConnection::finish, tcp_conn)));

		// request made to receive a stream of Events
		if (verb == "status") {
			// use local array to identify the reactor_id
			// possibly a secondary id, for multiple instances per reactor_id
			// get the status for this capture...
			unsigned slot = boost::lexical_cast<boost::uint32_t>(branches[0]);
			if (slot < m_writers.size() && m_writers[slot]) {
				std::string response = m_writers[slot]->getStatus();
				response_writer->write(dtd + response);
			} else {
				response_writer->write(dtd + "<Error>Invalid slot defined</Error>");
			}
		} else if (verb == "start") {
			unsigned slot;
			// Try to find an empty slot
			for (slot = 0; slot < m_writers.size(); slot++)
				if (!m_writers[slot]) break;
			// If no empty slots, clear oldest
			if (slot == m_writers.size()) {
				// FIXME: find oldest, and wipe out
				slot = 0;
			}
			VocabularyPtr vocab_ptr(getConfig().getReactionEngine().getVocabulary());
			// create a MonitorWriter object that will be used to send Events
			m_writers[slot].reset(new MonitorWriter(getConfig().getReactionEngine(), vocab_ptr, reactor_id, 1000, true));
			m_writers[slot]->start();
			HTTPResponseWriterPtr response_writer(HTTPResponseWriter::create(tcp_conn, *request,
										  boost::bind(&TCPConnection::finish, tcp_conn)));
			std::ostringstream xml;
			xml << dtd << "<MonitorService>" << slot << "</MonitorService>";
			response_writer->write(xml);
		} else if (verb == "stop") {
			unsigned slot = boost::lexical_cast<boost::uint32_t>(branches[0]);
			if (slot < m_writers.size() && m_writers[slot])
				m_writers[slot]->stop();
		} else if (verb == "delete") {
			unsigned slot = boost::lexical_cast<boost::uint32_t>(branches[0]);
			if (slot < m_writers.size() && m_writers[slot]) {
				m_writers[slot]->stop();
				m_writers[slot].reset();
			}
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
