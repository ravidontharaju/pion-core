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

#include <boost/lexical_cast.hpp>
#include <pion/platform/ConfigManager.hpp>
#include <pion/platform/Reactor.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of Reactor

const std::string			Reactor::REACTOR_ELEMENT_NAME = "Reactor";
const std::string			Reactor::RUNNING_ELEMENT_NAME = "Running";
const std::string			Reactor::EVENTS_IN_ELEMENT_NAME = "EventsIn";
const std::string			Reactor::EVENTS_OUT_ELEMENT_NAME = "EventsOut";
const std::string			Reactor::ID_ATTRIBUTE_NAME = "id";
	
	
// Reactor member functions

void Reactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	ConfigWriteLock cfg_lock(*this);
	PlatformPlugin::setConfig(v, config_ptr);
}

void Reactor::updateVocabulary(const Vocabulary& v)
{
	ConfigWriteLock cfg_lock(*this);
	PlatformPlugin::updateVocabulary(v);
}

bool Reactor::startOutRunning(const xmlNodePtr config_ptr, bool exec_start)
{
	// Get the default behavior regarding whether the Reactor should start out running.
	bool start_out_running = (getType() == Reactor::TYPE_COLLECTION? false : true);

	// Override the default behavior, if the Reactor's run status is specified in the configuration.
	if (config_ptr) {
		std::string run_status_str;
		if (ConfigManager::getConfigOption(Reactor::RUNNING_ELEMENT_NAME, run_status_str, config_ptr)) {
			start_out_running = (run_status_str == "true");
		}
	}
	
	// start the reactor ?
	if (exec_start && start_out_running && !isRunning()) {
		start();
	}
	
	return start_out_running;
}
	
void Reactor::addConnection(Reactor& output_reactor)
{
	ConfigWriteLock cfg_lock(*this);
	
	// check if it already connected
	if (m_connections.find(output_reactor.getId()) != m_connections.end())
		throw AlreadyConnectedException(output_reactor.getId());
	
	// add the new connection
	m_connections.insert(std::make_pair(output_reactor.getId(),
										OutputConnection(&output_reactor)));
}

void Reactor::addConnection(const std::string& connection_id,
							EventHandler connection_handler)
{
	ConfigWriteLock cfg_lock(*this);

	// check if it already connected
	if (m_connections.find(connection_id) != m_connections.end())
		throw AlreadyConnectedException(connection_id);
	
	// add the new connection
	m_connections.insert(std::make_pair(connection_id, connection_handler));
}

void Reactor::removeConnection(const std::string& connection_id)
{
	ConfigWriteLock cfg_lock(*this);
	
	// find the connection to remove
	ConnectionMap::iterator i = m_connections.find(connection_id);
	if (i == m_connections.end())
		throw ConnectionNotFoundException(connection_id);
	
	// remove the connection
	m_connections.erase(i);
}

void Reactor::query(std::ostream& out, const QueryBranches& branches,
	const QueryParams& qp)
{
	writeBeginReactorXML(out);
	writeStatsOnlyXML(out);
	writeEndReactorXML(out);
}

void Reactor::writeStatsOnlyXML(std::ostream& out) const
{
	out << '<' << RUNNING_ELEMENT_NAME << '>'
		<< (isRunning() ? "true" : "false")
		<< "</" << RUNNING_ELEMENT_NAME << '>' << std::endl
		<< '<' << EVENTS_IN_ELEMENT_NAME << '>' << getEventsIn()
		<< "</" << EVENTS_IN_ELEMENT_NAME << '>' << std::endl
		<< '<' << EVENTS_OUT_ELEMENT_NAME << '>' << getEventsOut()
		<< "</" << EVENTS_OUT_ELEMENT_NAME << '>' << std::endl;
}

void Reactor::writeBeginReactorXML(std::ostream& out) const
{
	out << '<' << REACTOR_ELEMENT_NAME << ' ' << ID_ATTRIBUTE_NAME
		<< "=\"" << getId() << "\">" << std::endl;
}

void Reactor::writeEndReactorXML(std::ostream& out) const
{
	out << "</" << REACTOR_ELEMENT_NAME << '>' << std::endl;
}
	
	
}	// end namespace platform
}	// end namespace pion
