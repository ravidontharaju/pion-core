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

#include <pion/platform/Event.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of EventFactory
EventFactory::EventAllocatorFactory *	EventFactory::EventAllocatorFactory::m_instance_ptr = NULL;
boost::once_flag						EventFactory::EventAllocatorFactory::m_instance_flag = BOOST_ONCE_INIT;

	
// PionScheduler member functions

void EventFactory::EventAllocatorFactory::createInstance(void)
{
	static EventAllocatorFactory factory_instance;
	m_instance_ptr = &factory_instance;
}


}	// end namespace platform
}	// end namespace pion
