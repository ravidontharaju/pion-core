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

#ifndef __PION_PIONHASHMAP_HEADER__
#define __PION_PIONHASHMAP_HEADER__

#include <libpion/PionConfig.hpp>


#if defined(PION_HAVE_UNORDERED_MAP)
	#include <unordered_map>
	#define PION_HASH_MAP std::tr1::unordered_map
	#define PION_HASH_MULTIMAP std::tr1::unordered_multimap
#elif defined(PION_HAVE_EXT_HASH_MAP)
	#if __GNUC__ >= 3
		#include <ext/hash_map>
		#define PION_HASH_MAP __gnu_cxx::hash_map
		#define PION_HASH_MULTIMAP __gnu_cxx::hash_multimap
	#else
		#include <ext/hash_map>
		#define PION_HASH_MAP hash_map
		#define PION_HASH_MULTIMAP hash_multimap
	#endif
#elif defined(PION_HAVE_HASH_MAP)
	#include <hash_map>
	#define PION_HASH_MAP hash_map
	#define PION_HASH_MULTIMAP hash_multimap
#endif


#endif
