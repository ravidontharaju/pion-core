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

#include <boost/thread/mutex.hpp>
#include <pion/platform/ConfigManager.hpp>
#include "TransformReactor.hpp"

using namespace pion::platform;


namespace pion {		// begin namespace pion
namespace plugins {		// begin namespace plugins


// static members of TransformReactor

const std::string			TransformReactor::OUTGOING_EVENT_ELEMENT_NAME = "OutgoingEvent";
const std::string			TransformReactor::COPY_ORIGINAL_ELEMENT_NAME = "CopyOriginal";
const std::string			TransformReactor::DELIVER_ORIGINAL_NAME = "DeliverOriginal";

const std::string			TransformReactor::TERM_ELEMENT_NAME = "Term";
const std::string			TransformReactor::TYPE_ELEMENT_NAME = "Type";
const std::string			TransformReactor::VALUE_ELEMENT_NAME = "Value";

//const std::string			TransformReactor::EVENT_TYPE_NAME = "EventType";
const std::string			TransformReactor::LOOKUP_TERM_NAME = "LookupTerm";
const std::string			TransformReactor::LOOKUP_MATCH_ELEMENT_NAME = "Match";
const std::string			TransformReactor::LOOKUP_FORMAT_ELEMENT_NAME = "Format";
const std::string			TransformReactor::LOOKUP_DEFAULT_ELEMENT_NAME = "DefaultValue";
const std::string			TransformReactor::RULE_ELEMENT_NAME = "Rule";
const std::string			TransformReactor::RULES_STOP_ON_FIRST_ELEMENT_NAME = "StopOnFirstMatch";

const std::string			TransformReactor::TRANSFORMATION_ELEMENT_NAME = "Transformation";
const std::string			TransformReactor::TRANSFORMATION_SET_VALUE_NAME = "SetValue";

/*
 *  This is the spec, using annotated XML

<TransformReactor>
	<OutgoingEvent>obj-term</OutgoingEvent>
	<CopyOriginal>all-terms|if-not-defined|none</CopyOriginal>			-> DEFAULT: if-not-defined
	<DeliverOriginal>always|if-not-changed|never</DeliveryOriginal>		-> DEFAULT: never
[rpt]	<Transformation>
			<Term>dst-term</Term>
			<Type>AssignToValue|AssignToTerm|Lookup|Rules</Type>
			[see TransformReactor/Transformations/Type]
[/rpt]	</Transformation>
</TransformReactor>

TransformReactor/Transformations/Type = AssignToValue
			<Type>AssignToValue</Type>
			<Value>escape(value)</Value>

TransformReactor/Transformations/Type = AssignToTerm
			<Type>AssignToTerm</Type>
			<Value>src-term</Value>

TransformReactor/Transformations/Type = Lookup
			<Type>Lookup</Type>
			<LookupTerm>src-term</LookupTerm>
[opt]		<Match>escape(regexp)</Match>
[opt]		<Format>escape(format)</Format>
[opt]		<DefaultAction>undefined|src-term|output|fixedvalue</DefaultAction>
[opt]		<DefaultValue>escape(text)</DefaultValue>
[rpt/]		<Lookup key="escape(key)">escape(value)</Lookup>

TransformReactor/Transformations/Type = Rules
			<Type>Rules</Type>
			<StopOnFirstMatch>true|false</StopOnFirstMatch>			-> DEFAULT: true
[rpt]		<Rule>
				<Term>src-term</Term>
				<Type>test-type</Type>
				<Value>escape(test-value)</Value>
				<SetValue>escape(set-value)</SetValue>
[/rpt]		</Rule>

 */

// TransformReactor member functions

void TransformReactor::setConfig(const Vocabulary& v, const xmlNodePtr config_ptr)
{
	// first set config options for the Reactor base class
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::setConfig(v, config_ptr);

	// clear the current configuration
	m_transforms.clear();

	// Outgoing Event type -- i.e. what will the outgoing event be transformed into
	// Default (UNDEFINED_TERM_REF) -- make it the same as incoming event type
	// 	<OutgoingEvent>obj-term</OutgoingEvent>
	m_event_type = Vocabulary::UNDEFINED_TERM_REF;
	std::string event_type_str;
	if (ConfigManager::getConfigOption(OUTGOING_EVENT_ELEMENT_NAME, event_type_str, config_ptr))
	{
		if (!event_type_str.empty())
			m_event_type = v.findTerm(event_type_str);
	}

	// This really doesn't make much sense anymore -- you can wire the delivery of the original right through
	// it would make sense, if it was possible to deliver "if-not-changed" but TR2 always changes...
	// 	<DeliverOriginal>always|if-not-changed|never</DeliveryOriginal>		-> DEFAULT: never
	m_deliver_original = DO_NEVER;
	std::string deliver_original_str;
	if (ConfigManager::getConfigOption(DELIVER_ORIGINAL_NAME, deliver_original_str, config_ptr))
	{
		if (deliver_original_str == "true" || deliver_original_str == "always")
			m_deliver_original = DO_ALWAYS;
		else if (deliver_original_str == "if-not-changed")
			m_deliver_original = DO_SOMETIMES;
		// Could add code to throw if d_o_s is not "never"
	}

	// What fields/terms of the original event should be COPIED into the new event
	// <CopyOriginal>all-terms|if-not-defined|none</CopyOriginal>			-> DEFAULT: if-not-defined
	m_copy_original = COPY_UNCHANGED;
	std::string copy_original_str;
	if (ConfigManager::getConfigOption(COPY_ORIGINAL_ELEMENT_NAME, copy_original_str, config_ptr))
	{
		if (copy_original_str == "all-terms")
			m_copy_original = COPY_ALL;
		else if (copy_original_str == "none")
			m_copy_original = COPY_NONE;
		// Could add code to throw if c_o_s is not "if-not-defined"
	}

	// now, parse transformation rules
	// [rpt]	<Transformation>
	xmlNodePtr transformation_node = config_ptr;
	while ( (transformation_node = ConfigManager::findConfigNodeByName(TRANSFORMATION_ELEMENT_NAME, transformation_node)) != NULL)
	{
		// parse new Transformation rule

		// get the Term used for the Transformation rule
		//	<Term>src-term</Term>
		std::string term_id;
		if (! ConfigManager::getConfigOption(TERM_ELEMENT_NAME, term_id,
											 transformation_node->children))
			throw EmptyTermException(getId());

		// make sure that the Term is valid
		const Vocabulary::TermRef term_ref = v.findTerm(term_id);
		if (term_ref == Vocabulary::UNDEFINED_TERM_REF)
			throw UnknownTermException(getId());

		// get the Type of transformation
		//	<Type>AssignToValue|AssignToTerm|Lookup|Rules</Type>
		std::string type_str;
		if (! ConfigManager::getConfigOption(TYPE_ELEMENT_NAME, type_str,
											 transformation_node->children))
			throw EmptyTypeException(getId());	// TODO: Improve the error message

		// Add the transformation
		Transform *new_transform;
		if (type_str == "AssignToValue")
			new_transform = new TransformAssignValue(v, v[term_ref], transformation_node->children);
		else if (type_str == "AssignToTerm")
			new_transform = new TransformAssignTerm(v, v[term_ref], transformation_node->children);
		else if (type_str == "Lookup")
			new_transform = new TransformLookup(v, v[term_ref], transformation_node->children);
		else if (type_str == "Rules")
			new_transform = new TransformRules(v, v[term_ref], transformation_node->children);
		else
			throw InvalidTransformation(type_str);

		m_transforms.push_back(new_transform);

		// step to the next Comparison rule
		transformation_node = transformation_node->next;
	}
}

void TransformReactor::updateVocabulary(const Vocabulary& v)
{
	// first update anything in the Reactor base class that might be needed
	boost::mutex::scoped_lock reactor_lock(m_mutex);
	Reactor::updateVocabulary(v);

	// update Vocabulary for each of the rules
	for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); ++i) {
		(*i)->updateVocabulary(v);
	}
}

void TransformReactor::operator()(const EventPtr& e)
{
	if (isRunning()) {
		boost::mutex::scoped_lock reactor_lock(m_mutex);
		incrementEventsIn();

		EventPtr new_e;
		// Create new event; either same type (if UNDEFINED) or defined type
		m_event_factory.create(new_e, m_event_type == Vocabulary::UNDEFINED_TERM_REF ? e->getType() : m_event_type);

		// Copy terms over from original
		switch (m_copy_original) {
			case COPY_ALL:				// Copy all terms over from original event
				*new_e += *e;
				break;
			case COPY_UNCHANGED:		// Copy ONLY terms, that are not defined in transformations...
				*new_e += *e;		// TODO: FIX THIS TO ONLY COPY NON-DEFINED
				break;
			case COPY_NONE:				// Do not copy terms from original event
				break;
		}

		for (TransformChain::iterator i = m_transforms.begin(); i != m_transforms.end(); i++)
			(*i)->transform(new_e);

		deliverEvent(new_e);			// Deliver the modified event

		// Transformation is done, deliver original event?
		if (m_deliver_original != DO_NEVER)
		 	deliverEvent(e);
	}
}


}	// end namespace plugins
}	// end namespace pion


/// creates new TransformReactor objects
extern "C" PION_PLUGIN_API pion::platform::Reactor *pion_create_TransformReactor(void) {
	return new pion::plugins::TransformReactor();
}

/// destroys TransformReactor objects
extern "C" PION_PLUGIN_API void pion_destroy_TransformReactor(pion::plugins::TransformReactor *reactor_ptr) {
	delete reactor_ptr;
}
