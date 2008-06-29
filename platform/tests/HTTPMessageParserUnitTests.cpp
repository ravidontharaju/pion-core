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
#include <boost/test/unit_test.hpp>
#include <pion/net/HTTPMessageParser.hpp>

#include "HTTPMessageParserUnitTestsData.inc"

using namespace pion::net;

BOOST_AUTO_TEST_CASE(testHTTPMessageParser)
{
	HTTPMessageParser request_parser(true);
	BOOST_CHECK(request_parser.readNext((const char*)request_data_1, sizeof(request_data_1)));

	HTTPMessageParser response_parser(false);
	BOOST_CHECK(response_parser.readNext((const char*)response_data_1, sizeof(response_data_1)));
}

BOOST_AUTO_TEST_CASE(testHTTPMessageParser_MultiFrame)
{
	HTTPMessageParser request_parser(true);
	BOOST_CHECK(request_parser.readNext((const char*)request_data_1, sizeof(request_data_1)));

	HTTPMessageParser response_parser(false);
	const unsigned char* frames[] = { resp2_frame0, resp2_frame1, resp2_frame2, 
			resp2_frame3, resp2_frame4, resp2_frame5, resp2_frame6 };

	size_t sizes[] = { sizeof(resp2_frame0), sizeof(resp2_frame1), sizeof(resp2_frame2), 
			sizeof(resp2_frame3), sizeof(resp2_frame4), sizeof(resp2_frame5), sizeof(resp2_frame6) };
	int frame_cnt = sizeof(frames)/sizeof(frames[0]);

	for(int i=0; i <  frame_cnt - 1; i++ )
	{
		BOOST_CHECK( boost::indeterminate(response_parser.readNext((const char*)frames[i], sizes[i])) );
	}

	BOOST_CHECK( response_parser.readNext((const char*)frames[frame_cnt - 1], sizes[frame_cnt - 1]) );
}
