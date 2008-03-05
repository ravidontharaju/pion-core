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

#ifndef __PION_QUERY_HEADER__
#define __PION_QUERY_HEADER__

#include <string>
#include <boost/cstdint.hpp>
#include <boost/noncopyable.hpp>
#include <pion/PionConfig.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)

// forward declarations used by Query
class Database;

	
///
/// Query: abstract class for representing a compiled database query
///
class Query
	: private boost::noncopyable
{
public:
		
	/// virtual destructor -> this class is just an interface
	virtual ~Query() {}
	
	/**
	 * binds a std::string value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindString(unsigned int param, const std::string& value) = 0;
	
	/**
	 * binds a string (const char *) value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindString(unsigned int param, const char *value) = 0;
	
	/**
	 * binds an integer value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindInt(unsigned int param, const boost::int32_t value) = 0;
	
	/**
	 * binds an unsigned integer value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindUInt(unsigned int param, const boost::uint32_t value) = 0;
	
	/**
	 * binds a big integer value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindBigInt(unsigned int param, const boost::int64_t value) = 0;
	
	/**
	 * binds an unsigned big integer value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindUBigInt(unsigned int param, const boost::uint64_t value) = 0;
	
	/**
	 * binds a floating point number value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindFloat(unsigned int param, const float value) = 0;
	
	/**
	 * binds a double floating point number value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindDouble(unsigned int param, const double value) = 0;
	
	/**
	 * binds a long double floating point number value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindLongDouble(unsigned int param, const long double value) = 0;
	
	/**
	 * binds a date_time value to a query parameter
	 * 
	 * @param param the query parameter number to which the value will be bound
	 * @param value the value to bind to the query parameter
	 */
	virtual void bindDateTime(unsigned int param, const PionDateTime& value) = 0;
	
	/**
	 * runs the compiled query
	 *
	 * @return true if there is a result row available
	 */
	virtual bool run(void) = 0;

	/// resets the compiled query so that it can be run again
	virtual void reset(void) = 0;
	
	/// returns the SQL that was compiled to initialize this query
	inline const std::string& getSQL(void) const { return m_sql_query; }
	
	
protected:
	
	/**
	 * this class can only be constructed by its descendants
	 *
	 * @param sql_query the SQL to use to initialize this query
	 */
	Query(const std::string& sql_query)
		: m_sql_query(sql_query)
	{}
	
	
private:
	
	/// the SQL that was compiled to initialize this query
	const std::string					m_sql_query;
};	

	
/// data type used to uniquely identify a specific type of database query
typedef std::string						QueryID;

	
/// data type used for Query smart pointers
typedef boost::shared_ptr<Query>		QueryPtr;


}	// end namespace platform
}	// end namespace pion

#endif
