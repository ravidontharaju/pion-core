// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2009 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#ifndef __PION_PIONPLATFORMUNITTEST_HEADER__
#define __PION_PIONPLATFORMUNITTEST_HEADER__

#include <fstream>
#include <boost/function.hpp>
#include <pion/PionScheduler.hpp>
#include <pion/platform/Event.hpp>
#include <pion/platform/Codec.hpp>
#include <pion/platform/ReactionEngine.hpp>

/// returns the path to the unit test config file directory
const std::string& get_config_file_dir(void);

/// returns the path to the unit test log file directory
const std::string& get_log_file_dir(void);

const std::string CONFIG_FILE_DIR(get_config_file_dir());
const std::string LOG_FILE_DIR(get_log_file_dir());

const std::string VOCABS_CONFIG_FILE(CONFIG_FILE_DIR + "vocabularies.xml");
const std::string VOCABS_TEMPLATE_FILE(CONFIG_FILE_DIR + "vocabularies.tmpl");
const std::string CODECS_CONFIG_FILE(CONFIG_FILE_DIR + "codecs.xml");
const std::string CODECS_TEMPLATE_FILE(CONFIG_FILE_DIR + "codecs.tmpl");
const std::string DATABASES_CONFIG_FILE(CONFIG_FILE_DIR + "databases.xml");
const std::string DATABASES_TEMPLATE_FILE(CONFIG_FILE_DIR + "databases.tmpl");
const std::string REACTORS_CONFIG_FILE(CONFIG_FILE_DIR + "reactors.xml");
const std::string REACTORS_TEMPLATE_FILE(CONFIG_FILE_DIR + "reactors.tmpl");
const std::string PROTOCOLS_CONFIG_FILE(CONFIG_FILE_DIR + "protocols.xml");
const std::string PROTOCOLS_TEMPLATE_FILE(CONFIG_FILE_DIR + "protocols.tmpl");
const std::string USERS_CONFIG_FILE(CONFIG_FILE_DIR + "users.xml");
const std::string USERS_TEMPLATE_FILE(CONFIG_FILE_DIR + "users.tmpl");
const std::string SERVICES_CONFIG_FILE(CONFIG_FILE_DIR + "services.xml");
const std::string SERVICES_TEMPLATE_FILE(CONFIG_FILE_DIR + "services.tmpl");
const std::string PLATFORM_CONFIG_FILE(CONFIG_FILE_DIR + "platform.xml");
const std::string PLATFORM_TEMPLATE_FILE(CONFIG_FILE_DIR + "platform.tmpl");


struct PionPlatformUnitTest {

	template <typename StatisticType>
	static void checkStatisticIsGE(boost::function0<StatisticType> get_stat_f,
		const StatisticType expected_value, const boost::uint32_t wait_seconds)
	{
		// wait up to one second for the number to exceed the expected value
		const int num_checks_allowed = 10 * wait_seconds;
		for (int i = 0; i < num_checks_allowed; ++i) {
			if (get_stat_f() >= expected_value) break;
			pion::PionScheduler::sleep(0, 100000000); // 0.1 seconds
		}
		BOOST_REQUIRE_GE( get_stat_f(), expected_value );
	}

	static void checkReactorEventsIn(pion::platform::ReactionEngine& reaction_engine,
		const std::string& reactor_id, const boost::uint64_t expected_value,
		const boost::uint32_t wait_seconds = 1)
	{
		boost::function0<boost::uint64_t> get_stat_f(
			boost::bind(&pion::platform::ReactionEngine::getEventsIn, 
			&reaction_engine, boost::cref(reactor_id)) );
		checkStatisticIsGE(get_stat_f, expected_value, wait_seconds);
	}

	static void checkReactorEventsOut(pion::platform::ReactionEngine& reaction_engine,
		const std::string& reactor_id, const boost::uint64_t expected_value,
		const boost::uint32_t wait_seconds = 1)
	{
		boost::function0<boost::uint64_t> get_stat_f(
			boost::bind(&pion::platform::ReactionEngine::getEventsOut, 
			&reaction_engine, boost::cref(reactor_id)) );
		checkStatisticIsGE(get_stat_f, expected_value, wait_seconds);
	}
	
	static boost::uint64_t feedFileToReactor(pion::platform::ReactionEngine& reaction_engine,
		const std::string& reactor_id, pion::platform::Codec& codec_ref, const std::string& log_file)
	{
		std::ifstream in(log_file.c_str(), std::ios::in);
		BOOST_REQUIRE(in.is_open());
	
		boost::uint64_t events_read = 0;
		pion::platform::EventPtr event_ptr;
		pion::platform::EventFactory event_factory;

		// push events from the log file into the clickstream sessionizer reactor
		event_factory.create(event_ptr, codec_ref.getEventType());
		while (codec_ref.read(in, *event_ptr)) {
			++events_read;
			reaction_engine.send(reactor_id, event_ptr);
			event_factory.create(event_ptr, codec_ref.getEventType());
		}
		
		in.close();
	
		return events_read;
	}
	
};

#endif
