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

#ifndef __PION_TRANSFORMREACTOR_HEADER__
#define __PION_TRANSFORMREACTOR_HEADER__

#include <vector>
#include <pion/PionConfig.hpp>
#include <pion/PionException.hpp>
#include <pion/platform/Reactor.hpp>
#include <pion/platform/Comparison.hpp>
#include <pion/platform/Transform.hpp>


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


///
/// TransformReactor: creates new Events that are derived from the Events it receives
/// (Work in progress...)
///
class TransformReactor :
	public pion::platform::Reactor
{
public:

	/// exception thrown if the TransformReactor configuration does not define a Term for a Comparison
	class EmptyTermException : public PionException {
	public:
		EmptyTermException(const std::string& reactor_id)
			: PionException("TransformReactor configuration is missing a term identifier: ", reactor_id) {}
	};

	/// exception thrown if the TransformReactor configuration uses an unknown Term for a Comparison
	class UnknownTermException : public PionException {
	public:
		UnknownTermException(const std::string& reactor_id)
			: PionException("TransformReactor configuration maps field to an unknown term: ", reactor_id) {}
	};

	/// exception thrown if the TransformReactor configuration does not define a Comparison type
	class EmptyTypeException : public PionException {
	public:
		EmptyTypeException(const std::string& reactor_id)
			: PionException("TransformReactor configuration does not include a comparison type: ", reactor_id) {}
	};

	/// exception thrown if the TransformReactor configuration does not define a Term for a Comparison
	class EmptyValueException : public PionException {
	public:
		EmptyValueException(const std::string& reactor_id)
			: PionException("TransformReactor configuration is missing a required comparison value: ", reactor_id) {}
	};

	class EmptyTransformationException : public PionException {
	public:
		EmptyTransformationException(const std::string& reactor_id)
			: PionException("TransformReactor configuration is missing the set value: ", reactor_id) {}
	};

	class EmptySetTermException : public PionException {
	public:
		EmptySetTermException(const std::string& reactor_id)
			: PionException("TransformReactor configuration is missing the set term identifier: ", reactor_id) {}
	};

	/// constructs a new TransformReactor object
	TransformReactor(void) : Reactor(TYPE_PROCESSING) {}

	/// virtual destructor: this class is meant to be extended
	virtual ~TransformReactor() { stop(); }

	/**
	 * sets configuration parameters for this Reactor
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 * @param config_ptr pointer to a list of XML nodes containing Reactor
	 *                   configuration parameters
	 */
	virtual void setConfig(const pion::platform::Vocabulary& v, const xmlNodePtr config_ptr);

	/**
	 * this updates the Vocabulary information used by this Reactor; it should
	 * be called whenever the global Vocabulary is updated
	 *
	 * @param v the Vocabulary that this Reactor will use to describe Terms
	 */
	virtual void updateVocabulary(const pion::platform::Vocabulary& v);

	/**
	 * processes an Event by comparing its data to the configured RuleChain.
	 * Only Events which pass all Comparisons in the RuleChain will be
	 * delivered to the output connections.
	 *
	 * @param e pointer to the Event to process
	 */
	virtual void operator()(const pion::platform::EventPtr& e);


private:

	/// data type for a chain of Comparison rules
	typedef std::vector<pion::platform::Comparison>		RuleChain;

	/// data type for a chain of Transform rules
	typedef std::vector<pion::platform::Transform>		TransformChain;

	/// name of the term element for Pion XML config files
	static const std::string		COMPARISON_ELEMENT_NAME;

	/// name of the term element for Pion XML config files
	static const std::string		TERM_ELEMENT_NAME;

	/// name of the type element for Pion XML config files
	static const std::string		TYPE_ELEMENT_NAME;

	/// name of the value element for Pion XML config files
	static const std::string		VALUE_ELEMENT_NAME;

	/// name of the 'match all values' element for Pion XML config files
	static const std::string		MATCH_ALL_VALUES_ELEMENT_NAME;

	/// name of the XML part containing transformation rules
	static const std::string		TRANSFORMATION_ELEMENT_NAME;

	/// Do all the conditions have to be met before transformation activates
	static const std::string		ALL_CONDITIONS_ELEMENT_NAME;

	/// Deliver original (in additions to modified)
	static const std::string		DELIVER_ORIGINAL_NAME;

	/// Value to set transformation result
	static const std::string		TRANSFORMATION_SET_VALUE_NAME;

	/// Does transformation occur in-place (or add)
	static const std::string		TRANSFORMATION_INPLACE_NAME;

	/// Set Term (if not InPlace)
	static const std::string		TRANSFORMATION_SET_TERM_NAME;

	/// a chain of Comparison rules used to filter out unwanted Events
	RuleChain						m_rules;

	/// chain of Transformations
	TransformChain					m_transforms;

	/// should all the conditions match before transformations take place
	bool							m_all_conditions;

	/// deliver original event
	enum { DO_NEVER, DO_SOMETIMES, DO_ALWAYS }
									m_deliver_original;

	/// One event_factory to manufacture the outgoing/duplicated events
	pion::platform::EventFactory	m_event_factory;
};

}	// end namespace plugins
}	// end namespace pion

#endif
