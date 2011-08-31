// ------------------------------------------------------------------------
// Pion is a development platform for building Reactors that process Events
// ------------------------------------------------------------------------
// Copyright (C) 2007-2011 Atomic Labs, Inc.  (http://www.atomiclabs.com)
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

#include <unicode/ucnv.h>
#include <unicode/ustring.h>
#include <pion/platform/Event.hpp>


namespace pion {		// begin namespace pion
namespace platform {	// begin namespace platform (Pion Platform Library)


// static members of EventFactory::EventAllocatorFactory
EventFactory::EventAllocatorFactory *	EventFactory::EventAllocatorFactory::m_instance_ptr = NULL;
boost::once_flag						EventFactory::EventAllocatorFactory::m_instance_flag = BOOST_ONCE_INIT;

	
// EventFactory::EventAllocatorFactory member functions

void EventFactory::EventAllocatorFactory::createInstance(void)
{
	static EventAllocatorFactory factory_instance;
	m_instance_ptr = &factory_instance;
}

bool EventValidator::isValidUTF8(const char* ptr, const std::size_t len, std::size_t* trimmed_len) {
	size_t offset = len;

	if (len == 0) {
		if (trimmed_len) *trimmed_len = 0;
		return true;
	}

	if (trimmed_len) {
		// In the case where a sequence of bytes ending at ptr + offset constitutes an incomplete 
		// UTF-8 code point, this will decrease 'offset' to point to the beginning of that code point.
		// Can't use U8_SET_CP_START or U8_SET_CP_START_UNSAFE, because they depend on the byte
		// after the offset, which could be anything (e.g. uninitialized memory).
		int i = len - 1;
		if (! U8_IS_SINGLE(ptr[i])) {
			while (U8_IS_TRAIL(ptr[i]) && len - i <= 4 && i >= 0)
				i--;
			if (i < 0)
				return false;
			if (len - i > 4)
				return false;
			if (! U8_IS_LEAD(ptr[i]))
				return false; // a trail byte must be preceded by another trail byte or a lead byte
			unsigned int n = U8_COUNT_TRAIL_BYTES(ptr[i]);
			if (i + n < len - 1)
				return false; // too many trail bytes
			if (i + n > len - 1)
				offset = i;   // back up to just before the lead byte
			// i + n == len - 1 ==> offset OK
		}
		if (offset == 0) {
			*trimmed_len = 0;
			return true;
		}
	}

	// Test input to see if it's valid UTF-8.
	UErrorCode errorCode = U_ZERO_ERROR;
	u_strFromUTF8(NULL, 0, NULL, ptr, offset, &errorCode);
	if (errorCode == U_BUFFER_OVERFLOW_ERROR) {
		// U_BUFFER_OVERFLOW_ERROR is expected since destCapacity = 0
		if (trimmed_len)
			*trimmed_len = offset;
		return true;
	} else if (errorCode == U_INVALID_CHAR_FOUND)
		return false;
	else
		throw ValidationException(u_errorName(errorCode));
}

size_t EventValidator::getCleansedUTF8Length(const char* ptr, const std::size_t len) {
	// Determine how many substitutions will need to be made.
	UErrorCode errorCode = U_ZERO_ERROR;
	int32_t utf_16_len;
	int32_t num_substitutions;
	const UChar32 REPLACEMENT_CHARACTER = 0xFFFD;
	u_strFromUTF8WithSub(NULL, 0, &utf_16_len, ptr, len, REPLACEMENT_CHARACTER, &num_substitutions, &errorCode);

	// Each bad UTF-8 character will be replaced by 3 bytes (representing the replacement character) in the safe UTF-8.
	// Since it might be the case that multiple bytes are replaced by a single replacement character, this is an upper bound.
	return len + 2 * num_substitutions;
}

void EventValidator::cleanseUTF8_TEMP(const char* ptr, const std::size_t len, char* buf, size_t* buf_len) {
	// We'll convert to UTF-16, replacing invalid characters, then convert back to UTF-8.
	// First, determine how large a buffer we need for the UTF-16 bytes.
	UErrorCode errorCode = U_ZERO_ERROR;
	int32_t utf_16_len;
	int32_t num_substitutions;
	const UChar32 REPLACEMENT_CHARACTER = 0xFFFD;
	u_strFromUTF8WithSub(NULL, 0, &utf_16_len, ptr, len, REPLACEMENT_CHARACTER, &num_substitutions, &errorCode);

	// Each bad UTF-8 character will be replaced by 3 bytes (representing the replacement character) in the safe UTF-8.
	// Since it might be the case that multiple bytes are replaced by a single replacement character, this is an upper bound.
	int32_t length_of_safe_content_buffer = len + 2 * num_substitutions;

	UChar* utf_16_buf = new UChar[utf_16_len];
	errorCode = U_ZERO_ERROR;
	u_strFromUTF8WithSub(utf_16_buf, utf_16_len, NULL, ptr, len, REPLACEMENT_CHARACTER, &num_substitutions, &errorCode);

	int32_t repaired_content_length = 0;
	u_strToUTF8(buf, length_of_safe_content_buffer, &repaired_content_length, utf_16_buf, utf_16_len, &errorCode);

	*buf_len = (size_t)repaired_content_length;

	delete [] utf_16_buf;
}

void EventValidator::cleanseUTF8(EventAllocator& blob_alloc, const char* ptr, const std::size_t len, char* buf, size_t* buf_len) {
	// We'll convert to UTF-16, replacing invalid characters, then convert back to UTF-8.
	// First, determine how large a buffer we need for the UTF-16 bytes.
	UErrorCode errorCode = U_ZERO_ERROR;
	int32_t utf_16_len;
	int32_t num_substitutions;
	const UChar32 REPLACEMENT_CHARACTER = 0xFFFD;
	u_strFromUTF8WithSub(NULL, 0, &utf_16_len, ptr, len, REPLACEMENT_CHARACTER, &num_substitutions, &errorCode);

	// Each bad UTF-8 character will be replaced by 3 bytes (representing the replacement character) in the safe UTF-8.
	// Since it might be the case that multiple bytes are replaced by a single replacement character, this is an upper bound.
	int32_t length_of_safe_content_buffer = len + 2 * num_substitutions;

	// It would be nice to use pion::PionBlob<UChar, EventAllocator> here, but PionBlob doesn't work right
	// with sizeof(CharType) > 1.
	pion::PionBlob<char, EventAllocator> utf_16_buf;
	UChar* bptr = (UChar*)utf_16_buf.reserve(blob_alloc, utf_16_len * sizeof(UChar));

	errorCode = U_ZERO_ERROR;
	u_strFromUTF8WithSub(bptr, utf_16_len, NULL, ptr, len, REPLACEMENT_CHARACTER, &num_substitutions, &errorCode);

	int32_t cleansed_content_length = 0;
	u_strToUTF8(buf, length_of_safe_content_buffer, &cleansed_content_length, bptr, utf_16_len, &errorCode);
	*buf_len = (size_t)cleansed_content_length;
}


}	// end namespace platform
}	// end namespace pion
