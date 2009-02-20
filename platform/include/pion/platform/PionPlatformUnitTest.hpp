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

#include <pion/PionScheduler.hpp>
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
	static bool checkReactorEventsIn(pion::platform::ReactionEngine& reaction_engine,
		const std::string& reactor_id, const boost::uint64_t expected)
	{
		for (int i = 0; i < 10; ++i) {
			if (reaction_engine.getEventsIn(reactor_id) == expected) break;
			pion::PionScheduler::sleep(0, 100000000); // 0.1 seconds
		}
		return (reaction_engine.getEventsIn(reactor_id) == expected);
	}

	static bool checkReactorEventsOut(pion::platform::ReactionEngine& reaction_engine,
		const std::string& reactor_id, const boost::uint64_t expected)
	{
		for (int i = 0; i < 10; ++i) {
			if (reaction_engine.getEventsOut(reactor_id) == expected) break;
			pion::PionScheduler::sleep(0, 100000000); // 0.1 seconds
		}
		return (reaction_engine.getEventsOut(reactor_id) == expected);
	}
};

#endif
