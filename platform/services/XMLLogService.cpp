// ------------------------------------------------------------------
// pion-net: a C++ framework for building lightweight HTTP interfaces
// ------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See http://www.boost.org/LICENSE_1_0.txt
//

#include "XMLLogService.hpp"

// This only works with LOG4CPLUS
#include <log4cplus/spi/loggingevent.h>
#include <boost/lexical_cast.hpp>

#include <pion/net/HTTPResponseWriter.hpp>

using namespace pion;
using namespace pion::net;
using namespace pion::platform;

namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of XMLLogServiceAppender

const unsigned int		XMLLogServiceAppender::DEFAULT_MAX_EVENTS = 100;


// XMLLogServiceAppender member functions

XMLLogServiceAppender::XMLLogServiceAppender(void)
	: m_max_events(DEFAULT_MAX_EVENTS), m_num_events(0)
	{}


void XMLLogServiceAppender::append(const log4cplus::spi::InternalLoggingEvent& event)
{
	std::string key(boost::lexical_cast<std::string>(event.getLogLevel()));
	key  += '.' + boost::lexical_cast<std::string>(event.getTimestamp().sec());
	std::string val;
	val = "<LogLevel>" + ConfigManager::xml_encode(m_log_level_manager.toString(event.getLogLevel()))
		+ "</LogLevel><Timestamp>" + ConfigManager::xml_encode(boost::lexical_cast<std::string>(event.getTimestamp().sec()))
		+ "</Timestamp><LoggerName>" + ConfigManager::xml_encode(event.getLoggerName())
		+ "</LoggerName><Message>" + ConfigManager::xml_encode(event.getMessage())
		+ "</Message>";
	boost::mutex::scoped_lock log_lock(m_log_mutex);
	// FIXME: severity:second must be unique, or it fails to insert...
	m_log_event_queue[key] = val;							// Add the new entry, sort as appropriate
	if (m_log_event_queue.size() > m_max_events)			// Queue size exceeded?
		m_log_event_queue.erase(m_log_event_queue.begin());	// Whack the least important
}

void XMLLogServiceAppender::writeLogEvents(pion::net::HTTPResponseWriterPtr& writer)
{
	std::ostringstream xml;
	xml << "<Events>";
	{
		boost::mutex::scoped_lock log_lock(m_log_mutex);	// Protect the iterator for insertion
		for (LOG_QUEUE::reverse_iterator ir = m_log_event_queue.rbegin(); ir != m_log_event_queue.rend(); ++ir)
			xml << "<Event id=\"" << ir->first << "\">" << ir->second << "</Event>";
	}
	xml << "</Events>";
	writer << xml.str();
}


// XMLLogService member functions

XMLLogService::XMLLogService(void)
	: m_log_appender_ptr(new XMLLogServiceAppender())
{
	m_log_appender_ptr->setName("XMLLogServiceAppender");
	log4cplus::Logger::getRoot().addAppender(m_log_appender_ptr);
}

XMLLogService::~XMLLogService()
{
	// removeAppender() also deletes the object
	log4cplus::Logger::getRoot().removeAppender("XMLLogServiceAppender");
}

/// handles requests for XMLLogService
void XMLLogService::operator()(HTTPRequestPtr& request, TCPConnectionPtr& tcp_conn)
{
	// Set Content-type to "text/plain" (plain ascii text)
	HTTPResponseWriterPtr writer(HTTPResponseWriter::create(tcp_conn, *request,
															boost::bind(&TCPConnection::finish, tcp_conn)));
	writer->getResponse().setContentType(HTTPTypes::CONTENT_TYPE_XML);
	getLogAppender().writeLogEvents(writer);
	writer->send();
}


}	// end namespace plugins
}	// end namespace pion


/// creates new XMLLogService objects
extern "C" PION_SERVICE_API pion::plugins::XMLLogService *pion_create_XMLLogService(void)
{
	return new pion::plugins::XMLLogService();
}

/// destroys XMLLogService objects
extern "C" PION_SERVICE_API void pion_destroy_XMLLogService(pion::plugins::XMLLogService *service_ptr)
{
	delete service_ptr;
}
