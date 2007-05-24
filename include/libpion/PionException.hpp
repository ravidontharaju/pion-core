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

#ifndef __PION_PIONEXCEPTION_HEADER__
#define __PION_PIONEXCEPTION_HEADER__

#include <libpion/PionConfig.hpp>
#include <exception>
#include <string>


namespace pion {	// begin namespace pion

///
/// PionException: basic exception class that defines a what() function
///
class PionException :
	public std::exception
{
public:
	// virtual destructor does not throw
	virtual ~PionException() throw () {}

	// constructors used for constant messages
	PionException(const char *what_msg) : m_what_msg(what_msg) {}
	PionException(const std::string& what_msg) : m_what_msg(what_msg) {}
	
	// constructors used for messages with a parameter
	PionException(const char *description, const std::string& param)
		: m_what_msg(std::string(description) + param) {}
	PionException(std::string description, const std::string& param)
		: m_what_msg(description + param) {}

	/// returns a desciptive message for the exception
	virtual const char* what() const throw() {
		return m_what_msg.c_str();
	}
	
private:
	
	// message returned by what() function
	const std::string	m_what_msg;
};

}	// end namespace pion

#endif
