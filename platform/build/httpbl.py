#!/usr/bin/python
# ----------------------------------------------------------
#  a simple Python script to query IP addresses in http::BL
# ----------------------------------------------------------
# Copyright (c) 2011 Atomic Labs, Inc.  All Rights Reserved.
#
# See http://www.projecthoneypot.org/httpbl_api.php

import sys, socket, re, optparse


# misc global variables for logging
VERBOSE = False


def print_result(ip_match):
	SEARCH_ENGINES = ( "Undocumented", "AltaVista", "Ask", "Baidu",
		"Excite", "Google", "Looksmart", "Lycos", "MSN", "Yahoo",
		"Cuil", "InfoSeek", "Miscellaneous" )
	if (ip_match[3] == 0):
		# search engines are special case
		print "result: Search Engine (%s)" % SEARCH_ENGINES[ ip_match[2] ]
		return
	# convert type int into list of types
	types = []
	if (ip_match[3] & 1):
		types.append('Suspicious')
	if (ip_match[3] & 2):
		types.append('Harvester')
	if (ip_match[3] & 4):
		types.append('Content Spammer')
	print "result: %s (days=%d, threat=%d)" % (", ".join(types), ip_match[1], ip_match[2])


def parse_ip(ip, errormsg):
	m = re.match("(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)", ip)
	if (not m):
		print "error: %s (%s)" % (errormsg, ip)
		sys.exit(1)
	return m


def dns_query(ip_query):
	if (VERBOSE): print "querying DNS for %s:" % ip_query
	query_result = None
	try:
		ip_match = parse_ip(socket.gethostbyname(ip_query), "DNS query returned invalid IPv4 address")
		query_result = ( int(ip_match.group(1)), int(ip_match.group(2)),
			int(ip_match.group(3)), int(ip_match.group(4)) )
	except socket.gaierror:
		pass
	return query_result


def parse_args():
	"""parses and returns command-line arguments"""
	# prepare argument parser
	parser = optparse.OptionParser(usage="usage: %prog [options] IP")
	parser.add_option("-k", "--key", action="store", default=None,
		help="Your http::BL Access Key")
	parser.add_option("-v", "--verbose", action="store_true", default=False,
		help="enables verbose operation (default=False)")
	# parse command-line arguments
	options, arguments = parser.parse_args()		
	# check validity of arguments
	if (len(arguments) != 1):
		print 'error: No IP address was specified'
		sys.exit(1)
	if (not options.key):
		print 'error: No http::BL Access Key was specified'
		sys.exit(1)
	options.ip = arguments[0]
	return options
	
	
def main():
	"""main processing function"""
	global VERBOSE
	# parse command-line options
	options = parse_args()
	VERBOSE = options.verbose
	# extract octets from IP address
	m = parse_ip(options.ip, "argument is not a valid IPv4 address")
	# build hostname to query
	ip_query = "%s.%s.%s.%s.%s.dnsbl.httpbl.org" % (options.key, m.group(4), m.group(3), m.group(2), m.group(1))
	# query DNS for http::BL result
	query_result = dns_query(ip_query)
	if (not query_result):
		print "no results found"
	elif (query_result[0] != 127):
		print "error: invalid DNS query result (%s!=127)" % query_result[0]
	else:
		print_result(query_result)


# call main() if script is being executed	
if __name__ == '__main__':
	main()

