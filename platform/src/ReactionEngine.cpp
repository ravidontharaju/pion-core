// ------------------------------------------------------------------
// pion-platform: a collection of libraries used by the Pion Platform
// ------------------------------------------------------------------
// Copyright (C) 2007 Atomic Labs, Inc.  (http://www.atomiclabs.com)
//
// pion-reactor is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pion-reactor is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pion-reactor.  If not, see <http://www.gnu.org/licenses/>.
//

#include <algorithm>
#include <pion/platform/ReactionEngine.hpp>

using namespace pion::reactor;


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of ReactionEngine
ReactionEngine *				ReactionEngine::m_instance_ptr = NULL;
boost::once_flag				ReactionEngine::m_instance_flag = BOOST_ONCE_INIT;


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
			i->second->stop();
		}
		m_is_running = false;
	}
}

void ReactionEngine::start(void)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	if (! m_is_running) {
		for (ReactorMap::iterator i = m_reactors.begin(); i != m_reactors.end(); ++i) {
			i->second->start();
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
		i->second->reset();
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
		i->second->clearStats();
	}
}

void ReactionEngine::add(ReactorPtr& r)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	m_reactors.insert(std::make_pair(r->getReactorID(), r));
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
	i->second->reset();
}

void ReactionEngine::clearStats(const std::string& reactor_id)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	i->second->clearStats();
}

void ReactionEngine::configure(const std::string& reactor_id,
							   const EventPtr& config)
{
	boost::mutex::scoped_lock engine_lock(m_mutex);
	ReactorMap::iterator i = m_reactors.find(reactor_id);
	if (i == m_reactors.end()) throw UnknownReactorException(reactor_id);
	i->second->configure(config);
}

}	// end namespace net
}	// end namespace platform
