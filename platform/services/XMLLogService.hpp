// ------------------------------------------------------------------
// pion-net: a C++ framework for building lightweight HTTP interfaces
// ------------------------------------------------------------------
// Copyright (C) 2007-2008 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// Distributed under the Boost Software License, Version 1.0.
// See http://www.boost.org/LICENSE_1_0.txt
//

#ifndef __PION_XMLLOGSERVICE_HEADER__
#define __PION_XMLLOGSERVICE_HEADER__

#include <boost/thread/mutex.hpp>
#include <boost/scoped_ptr.hpp>
#include <boost/tuple/tuple.hpp>
#include <pion/PionLogger.hpp>
#include <pion/net/WebService.hpp>
#include <pion/net/HTTPResponseWriter.hpp>
#include "PlatformConfig.hpp"
#include "PlatformService.hpp"
#include <string>
#include <list>
#include <deque>
#include <queue>

// This only works with LOG4CPLUS
#include <log4cplus/appender.h>
#include <log4cplus/loglevel.h>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins

	
///
/// XMLLogServiceAppender: caches log events in memory for use by XMLLogService
/// 
class XMLLogServiceAppender
		: public log4cplus::Appender
{
public:
	// default constructor and destructor
	XMLLogServiceAppender(void);
	virtual ~XMLLogServiceAppender() {}
	
	/// sets the maximum number of log events cached in memory
	inline void setMaxEvents(unsigned int n) { m_max_events = n; }
	
	/// writes the events cached in memory to a response stream
	void writeLogEvents(pion::net::HTTPResponseWriterPtr& writer);

	/// deletes the event with the specified ID from the queue
	void acknowledgeEvent(std::string id);

private:
	/// default maximum number of events cached in memory
	static const unsigned int				DEFAULT_MAX_EVENTS;
	
	/// maxiumum number of events cached in memory
	unsigned int							m_max_events;
	
	/// number of events currently cached in memory
	unsigned int							m_num_events;

	/// memory cache of pre-formatted log events
	std::list<std::string>					m_log_events;

	/// map queue of log events
	typedef std::map<std::string, std::string>	LOG_QUEUE;
	LOG_QUEUE								m_log_event_queue;

	/// mutex to make class thread-safe
	boost::mutex							m_log_mutex;

	public:
		// member functions inherited from the Appender interface class
		virtual void close() {}
	protected:
		virtual void append(const log4cplus::spi::InternalLoggingEvent& event);
	private:
		/// this is used to convert numeric log levels into strings
		log4cplus::LogLevelManager		m_log_level_manager;
};


///
/// XMLLogService: web service that displays log messages
/// 
class XMLLogService :
	public pion::server::PlatformService
{
public:
	// default constructor and destructor
	XMLLogService(void);
	virtual ~XMLLogService();
	
	/// handles a new HTTP request
	virtual void operator()(pion::net::HTTPRequestPtr& request,
							pion::net::TCPConnectionPtr& tcp_conn);

	/// returns the log appender used by XMLLogService
	inline XMLLogServiceAppender& getLogAppender(void) { return *m_log_appender_ptr; }
	
private:
	/// map of file extensions to MIME types
	XMLLogServiceAppender *	m_log_appender_ptr;
};

	
}	// end namespace plugins
}	// end namespace pion

#endif
