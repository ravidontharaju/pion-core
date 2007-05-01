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

#ifndef __PION_PIONLOGGER_HEADER__
#define __PION_PIONLOGGER_HEADER__

#include <libpion/PionConfig.hpp>

#if defined(PION_HAVE_LOG4CXX)

	// unfortunately, the current version of log4cxx has many problems that
	// produce very annoying warnings

	// this disables warnings before preprocessing the log4cxx headers
	#if defined __GNUC__
		#pragma GCC system_header
	#elif defined __SUNPRO_CC
		#pragma disable_warn
	#elif defined _MSC_VER
		#pragma warning(push, 1)
	#endif 

	// log4cxx headers
	#include <log4cxx/logger.h>
	#include <log4cxx/basicconfigurator.h>

	// this re-enables warnings
	#if defined __SUNPRO_CC
		#pragma enable_warn
	#elif defined _MSC_VER
		#pragma warning(pop)
	#endif 

	namespace pion {
		typedef log4cxx::Logger		PionLogger;
		typedef log4cxx::LoggerPtr	PionLoggerPtr;
	}

	#define PION_LOG_DEBUG	LOG4CXX_DEBUG
	#define PION_LOG_INFO	LOG4CXX_INFO
	#define PION_LOG_WARN	LOG4CXX_WARN
	#define PION_LOG_ERROR	LOG4CXX_ERROR
	#define PION_LOG_FATAL	LOG4CXX_FATAL

	#define PION_LOG_CONFIG_BASIC(LOG)		log4cxx::BasicConfigurator::configure();
	#define PION_LOG_SETLEVEL_DEBUG(LOG)	LOG->setLevel(log4cxx::Level::DEBUG);
	#define PION_LOG_SETLEVEL_INFO(LOG)		LOG->setLevel(log4cxx::Level::INFO);
	#define PION_LOG_SETLEVEL_WARN(LOG)		LOG->setLevel(log4cxx::Level::WARN);
	#define PION_LOG_SETLEVEL_ERROR(LOG)	LOG->setLevel(log4cxx::Level::ERROR);
	#define PION_LOG_SETLEVEL_FATAL(LOG)	LOG->setLevel(log4cxx::Level::FATAL);


#elif defined(PION_HAVE_LOG4CPLUS)


	// log4cplus headers
	#include <log4cplus/logger.h>
	#include <log4cplus/basicconfigurator.h>

	namespace pion {
		typedef log4cplus::Logger		PionLogger;
		typedef log4cplus::LoggerPtr	PionLoggerPtr;
	}

	#define PION_LOG_DEBUG	LOG4CXX_DEBUG
	#define PION_LOG_INFO	LOG4CXX_INFO
	#define PION_LOG_WARN	LOG4CXX_WARN
	#define PION_LOG_ERROR	LOG4CXX_ERROR
	#define PION_LOG_FATAL	LOG4CXX_FATAL

	#define PION_LOG_CONFIG_BASIC(LOG)		log4cplus:BasicConfigurator::configure();
	#define PION_LOG_SETLEVEL_DEBUG(LOG)	LOG->setLevel(log4cxx::Level::DEBUG);
	#define PION_LOG_SETLEVEL_INFO(LOG)		LOG->setLevel(log4cxx::Level::INFO);
	#define PION_LOG_SETLEVEL_WARN(LOG)		LOG->setLevel(log4cxx::Level::WARN);
	#define PION_LOG_SETLEVEL_ERROR(LOG)	LOG->setLevel(log4cxx::Level::ERROR);
	#define PION_LOG_SETLEVEL_FATAL(LOG)	LOG->setLevel(log4cxx::Level::FATAL);


#else

	// Logging is disabled -> add do-nothing stubs for logging
	namespace pion {
		struct PionLogger { static PionLoggerPtr getLogger(char *) { return 0; } }
		typedef int PionLoggerPtr;
	}

	// use "++logger" to avoid warnings about LOG not being used
	#define PION_LOG_DEBUG(logger, message) { if (false) ++logger; }
	#define PION_LOG_INFO(logger, message) { if (false) ++logger; }
	#define PION_LOG_WARN(logger, message) { if (false) ++logger; }
	#define PION_LOG_FATAL(logger, message) { if (false) ++logger; }


#endif

#endif
