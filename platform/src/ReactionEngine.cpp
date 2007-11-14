// ------------------------------------------------------------------
// pion-platform: a collection of libraries used by the Pion Platform
// ------------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// pion-platform is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pion-platform is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pion-platform.  If not, see <http://www.gnu.org/licenses/>.
//

#include <algorithm>
#include <pion/platform/ReactionEngine.hpp>

using namespace pion::reactor;


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ReactionEngine
ReactionEngine *		ReactionEngine::m_instance_ptr = NULL;
boost::once_flag		ReactionEngine::m_instance_flag = BOOST_ONCE_INIT;


// ReactionEngine member functions

void ReactionEngine::createInstance(void)
{
	// initialize the singleton instance
	static ReactionEngine reaction_engine_instance;
	m_instance_ptr = &reaction_engine_instance;
}

void ReactionEngine::stopNoLock(void)
{
	if (m_is_running) {
		for (ReactorMap::iterator i = m_reactors.begin(); i != m_reactors.end(); ++i) {
			i->second.first->stop();
		}
		m_is_running = false;
	}
}

void ReactionEngine::start(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	if (! m_is_running) {
		for (ReactorMap::iterator i = m_reactors.begin(); i != m_reactors.end(); ++i) {
			i->second.first->start();
		}
		m_is_running = true;
	}
}

void ReactionEngine::stop(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	stopNoLock();
}

void ReactionEngine::reset(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	stopNoLock();
	for (ReactorMap::iterator i = m_reactors.begin(); i != m_reactors.end(); ++i) {
		i->second.first->reset();
	}
}

void ReactionEngine::clear(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	stopNoLock();
	m_reactors.clear();
}

void ReactionEngine::clearStats(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	for (ReactorMap::iterator i = m_reactors.begin(); i != m_reactors.end(); ++i) {
		i->second.first->clearStats();
	}
}

void ReactionEngine::add(Reactor *reactor_ptr)
{
	PionPluginPtr<Reactor> plugin_ptr;
	boost::mutex::scoped_lock engine_lock(m_mutex);
	m_reactors.insert(std::make_pair(reactor_ptr->getId(),
									 std::make_pair(reactor_ptr, plugin_ptr)));
}

void ReactionEngine::load(const std::string& reactor_id,
						  const std::string& reactor_name)
{
	// search for the plug-in file using the configured paths
	bool is_static;
	void *create_func;
	void *destroy_func;
	
	// check if reactor is statically linked, and if not, try to resolve for dynamic
	is_static = PionPlugin::findStaticEntryPoint(reactor_name, &create_func, &destroy_func);

	// open up the plug-in's shared object library
	PionPluginPtr<Reactor> plugin_ptr;
	if (is_static) {
		plugin_ptr.openStaticLinked(reactor_name, create_func, destroy_func);	// may throw
	} else {
		plugin_ptr.open(reactor_name);	// may throw
	}
	
	// create a new reactor using the plug-in library
	Reactor *reactor_ptr(plugin_ptr.create());
	reactor_ptr->setId(reactor_id);
	
	// add the reactor to the engine's collection
	boost::mutex::scoped_lock engine_lock(m_mutex);
	m_reactors.insert(std::make_pair(reactor_ptr->getId(),
									 std::make_pair(reactor_ptr, plugin_ptr)));
	engine_lock.unlock();
	
	if (is_static) {
		PION_LOG_INFO(m_logger, "Loaded static reactor (" << reactor_id << "): " << reactor_name);
	} else {
		PION_LOG_INFO(m_logger, "Loaded reactor plug-in (" << reactor_id << "): " << reactor_name);
	}
}

void ReactionEngine::remove(const std::string& reactor_id)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	m_reactors.erase(i);
}

void ReactionEngine::reset(const std::string& reactor_id)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	i->second.first->reset();
}

void ReactionEngine::clearStats(const std::string& reactor_id)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	i->second.first->clearStats();
}

void ReactionEngine::configure(const std::string& reactor_id,
							   const EventPtr& config)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	i->second.first->configure(config);
}


// ReactionEngine::ReactorMap member functions

void ReactionEngine::ReactorMap::clear(void) {
	for (iterator i = begin(); i != end(); ++i) {
		if (i->second.second.is_open()) {
			i->second.second.destroy(i->second.first);
			i->second.second.close();
		} else {
			delete i->second.first;
		}
	}
	std::map<std::string, PluginPair>::clear();
}


}	// end namespace net
}	// end namespace platform
