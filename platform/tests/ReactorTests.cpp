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

#include <pion/PionConfig.hpp>
#include <pion/platform/VocabularyManager.hpp>
#include <pion/platform/CodecFactory.hpp>
#include <pion/platform/DatabaseManager.hpp>
#include <pion/platform/ReactionEngine.hpp>
#include <pion/PionUnitTestDefs.hpp>
#include <boost/cstdint.hpp>
#include <boost/thread/xtime.hpp>
#include <boost/thread/thread.hpp>
#include <boost/test/unit_test.hpp>
#include <boost/filesystem/operations.hpp>
#include <fstream>
#include <string>

using namespace pion;
using namespace pion::platform;


/// external functions defined in PionPlatformUnitTests.cpp
extern const std::string& get_config_file_dir(void);
extern void setup_logging_for_unit_tests(void);
extern void setup_plugins_directory(void);


/// static strings used by these unit tests
static const std::string REACTORS_CONFIG_FILE(get_config_file_dir() + "reactors.xml");
static const std::string REACTORS_TEMPLATE_FILE(get_config_file_dir() + "reactors.tmpl");
static const std::string REACTORS_BACKUP_FILE(get_config_file_dir() + "reactors.xml.bak");
static const std::string VOCAB_CLF_CONFIG_FILE(get_config_file_dir() + "vocab_clf.xml");
static const std::string CODECS_CLF_CONFIG_FILE(get_config_file_dir() + "codecs_clf.xml");
static const std::string COMBINED_LOG_FILE(get_config_file_dir() + "combined.log");


/// cleans up reactor config files in the working directory
void cleanup_reactor_config_files(void)
{
	if (boost::filesystem::exists(REACTORS_CONFIG_FILE))
		boost::filesystem::remove(REACTORS_CONFIG_FILE);
	if (boost::filesystem::exists(REACTORS_BACKUP_FILE))
		boost::filesystem::remove(REACTORS_BACKUP_FILE);
	boost::filesystem::copy_file(REACTORS_TEMPLATE_FILE, REACTORS_CONFIG_FILE);
}


/// fixture for testing filters on log file data
class ReactionEngineLogFilterTests_F {
public:
	ReactionEngineLogFilterTests_F()
		: m_vocab_mgr(), m_codec_factory(m_vocab_mgr), m_database_mgr(m_vocab_mgr),
		m_reaction_engine(m_vocab_mgr, m_codec_factory, m_database_mgr),
		m_combined_id("urn:uuid:3f49f2da-bfe3-11dc-8875-0016cb926e68"),
		m_ie_filter_id("urn:uuid:153f6c40-cb78-11dc-8fa0-0019e3f89cd2")
	{
		setup_logging_for_unit_tests();
		setup_plugins_directory();		
		cleanup_reactor_config_files();

		m_vocab_mgr.loadConfigFile(VOCAB_CLF_CONFIG_FILE);
		m_codec_factory.setConfigFile(CODECS_CLF_CONFIG_FILE);
		m_codec_factory.openConfigFile();
		m_reaction_engine.setConfigFile(REACTORS_CONFIG_FILE);
		m_reaction_engine.openConfigFile();

		m_combined_codec = m_codec_factory.getCodec(m_combined_id);
		BOOST_CHECK(m_combined_codec);
	}
	~ReactionEngineLogFilterTests_F() {}
	
	/**
	 * put the current thread to sleep for an amount of time
	 *
	 * @param nsec number of nanoseconds (10^-9) to sleep for
	 */
	inline void sleep_briefly(unsigned long nsec)
	{
		boost::xtime stop_time;
		boost::xtime_get(&stop_time, boost::TIME_UTC);
		stop_time.nsec += nsec;
		if (stop_time.nsec >= 1000000000) {
			stop_time.sec++;
			stop_time.nsec -= 1000000000;
		}
		boost::thread::sleep(stop_time);
	}
	
	
	VocabularyManager	m_vocab_mgr;
	CodecFactory		m_codec_factory;
	DatabaseManager		m_database_mgr;
	ReactionEngine		m_reaction_engine;
	const std::string	m_combined_id;
	const std::string	m_ie_filter_id;
	CodecPtr			m_combined_codec;
};


// CodecFactoryWithCodecLoaded_S contains tests for the common log format
BOOST_FIXTURE_TEST_SUITE(ReactionEngineLogFilterTests_S, ReactionEngineLogFilterTests_F)

BOOST_AUTO_TEST_CASE(checkCombinedCodecReadLogFile) {
	// start the reaction engine
	m_reaction_engine.start();
	
	// open the CLF log file
	std::ifstream in;
	in.open(COMBINED_LOG_FILE.c_str(), std::ios::in);
	BOOST_REQUIRE(in.is_open());

	// push events from the log file into the IE filter reactor
	boost::uint64_t events_read = 0;
	EventPtr event_ptr;
	while ((event_ptr = m_combined_codec->read(in))) {
		++events_read;
		m_reaction_engine.send(m_ie_filter_id, event_ptr);
	}
	
	// make sure that four events were read from the log
	BOOST_CHECK_EQUAL(events_read, static_cast<boost::uint64_t>(4));
	
	// make sure that the reactor received all of the events read
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsIn(m_ie_filter_id) == events_read) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsIn(m_ie_filter_id), events_read);
	
	// make sure that the number of operations matches the events read
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getTotalOperations() == events_read) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getTotalOperations(), events_read);

	// make sure that only one event passed the filter
	for (int i = 0; i < 10; ++i) {
		if (m_reaction_engine.getEventsOut(m_ie_filter_id) == static_cast<boost::uint64_t>(1)) break;
		sleep_briefly(100000000); // 0.1 seconds
	}
	BOOST_CHECK_EQUAL(m_reaction_engine.getEventsOut(m_ie_filter_id), static_cast<boost::uint64_t>(1));
}

BOOST_AUTO_TEST_SUITE_END()
