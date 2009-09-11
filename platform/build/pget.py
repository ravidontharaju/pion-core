#!/usr/bin/python
# ---------------------------------------------
# pion cookie authentication HTTP query wrapper
# ---------------------------------------------

import sys, httplib, optparse, re, xml.dom.minidom


class Reactor:
	"""Basic class to hold information about a reactor"""
	def __init__(self, id, type, name, comment):
		self.id = id
		self.type = type
		self.name = name
		self.comment = comment
	def __str__(self):
		return '%s(%s)' % (self.type, self.name)
	def __hash__(self):
		return hash(self.id)
	def __lt__(self, other):
		return self.type < other.type
	def __eq__(self, other):
		return self.id == other.id


# from http://code.activestate.com/recipes/576750/
pretty_print = lambda doc: '\n'.join([line for line in doc.toprettyxml(indent=' '*2).split('\n') if line.strip()])


def get_response(con, uristem, headers = {}):
	try:
		con.request('GET', uristem, None, headers)
	except:
		print 'error: unable to establish connection to Pion server'
		sys.exit(1)
	r = con.getresponse()
	if (r.status == 401):
		print 'error: Unable to authenticate to Pion server'
		sys.exit(1)
	if (r.status >= 400 and r.status <= 599):
		print 'error: response =', r.status, r.reason
		sys.exit(1)
	return r


def print_response(r):
	body = r.read()
	ctype = r.getheader('Content-Type');
	if (ctype.lower().startswith('text/xml')):
		doc = xml.dom.minidom.parseString(body)
		print pretty_print(doc)
		#print doc.toprettyxml()
		doc.unlink()
	else:
		print body


def get_cookie(con, user, password):
	r = get_response(con, '/login?user=' + user + '&pass=' + password)
	r.read()	# needed to reset the connection for the next request
	if (r.status != 204):
		print 'error: Bad response for Pion server login request (', r.status, ')'
		sys.exit(1)
	cookie_rx = re.compile(r'.*pion_session_id="([^"]+)".*')
	cookie_match = cookie_rx.match(r.getheader('Set-Cookie'))
	if (not cookie_match or cookie_match.lastindex != 1):
		print 'error: Unable to retrieve session cookie from Pion server'
		sys.exit(1)
	return cookie_match.group(1)


def get_con(options):
	# establish connection to Pion server
	if (options.ssl):
		con = httplib.HTTPSConnection(options.server, options.port);
	else:
		con = httplib.HTTPConnection(options.server, options.port);
	# get session cookie
	options.cookie = get_cookie(con, options.user, options.password)
	options.headers = {'Cookie' : 'pion_session_id="' + options.cookie + '"'}
	return con


def get_reactors(con, options):
	# query reactor configuration
	r = get_response(con, '/config/reactors', options.headers)
	if (r.status != 200):
		print 'error: Unable to retrieve reactor configuration'
		sys.exit(1)
	# parse XML response
	doc = xml.dom.minidom.parseString(r.read())
	reactor_nodes = doc.getElementsByTagName("Reactor")
	reactors = list()
	for r in reactor_nodes:
		# get attributes for each reactor
		id = r.attributes['id'].value
		type = r.getElementsByTagName("Plugin")[0].firstChild.data
		try: name = r.getElementsByTagName("Name")[0].firstChild.data
		except: pass
		try: comment = r.getElementsByTagName("Comment")[0].firstChild.data
		except: pass
		reactors.append( Reactor(id, type, name, comment) )
	doc.unlink()
	return reactors


def get_stats_xml(reactor, fields, node):
	if (node.localName in fields):
		try:
			reactor.stats.append( (node.localName, node.firstChild.data) )
		except: pass
	else:
		for n in node.childNodes:
			get_stats_xml(reactor, fields, n)
	

def get_stats(con, options, reactor, fields=()):
	# query reactor statistcs
	r = get_response(con, '/query/reactors/' + reactor.id, options.headers)
	if (r.status != 200):
		print 'error: Unable to retrieve reactor statistics: %s' % reactor.id
		sys.exit(1)
	# parse XML response
	doc = xml.dom.minidom.parseString(r.read())
	node = doc.getElementsByTagName("Reactor")[0]
	# extract statistic nodes
	reactor.running = node.getElementsByTagName('Running')[0].firstChild.data
	reactor.events_in = node.getElementsByTagName('EventsIn')[0].firstChild.data
	reactor.events_out = node.getElementsByTagName('EventsOut')[0].firstChild.data
	reactor.stats = list()
	if (fields):
		get_stats_xml(reactor, fields, node)


def get_arg_parser():
	# prepare argument parser
	parser = optparse.OptionParser()
	parser.add_option("-u", "--user", action="store", default="pion",
		help="name of user to authenticate as")
	parser.add_option("-p", "--password", action="store", default="pion",
		help="password of user to authenticate as")
	parser.add_option("-s", "--server", action="store", default="localhost",
		help="hostname or IP address of the Pion server")
	parser.add_option("", "--port", action="store", default=8888, type="int",
		help="port number on the Pion server to connect to")
	parser.add_option("", "--ssl", action="store_true", default=False,
		help="use SSL encryption for the Pion server connection")
	return parser


def parse_args():
	# prepare argument parser
	parser = get_arg_parser()
	parser.add_option("-r", "--reactor", action="store",
		help="identifier of reactor to perform an action upon")
	parser.add_option("", "--stats", action="store_true", default=False,
		help="retrieves statistics for one or all Pion reactors")
	parser.add_option("", "--start", action="store_true", default=False,
		help="starts a reactor if it is not already running")
	parser.add_option("", "--stop", action="store_true", default=False,
		help="stops a reactor if it is running")
	parser.add_option("", "--query", action="store",
		help="calls a reactor's query service")
	parser.add_option("-l", "--list", action="store", default=None,
		help="list reactors of a specific type (or \"all\")")
	# parse command-line arguments
	options, arguments = parser.parse_args()		
	# check validity of arguments
	if (options.reactor):
		if (options.start):
			options.uristem = '/config/reactors/' + options.reactor + '/start'
		elif (options.stop):
			options.uristem = '/config/reactors/' + options.reactor + '/stop'
		elif (options.stats):
			options.uristem = '/query/reactors/' + options.reactor
		elif (options.query):
			if (options.query[0] != '/'):
				options.query = '/' + options.query
			options.uristem = '/query/reactors/' + options.reactor + options.query
		else:
			options.uristem = '/config/reactors/' + options.reactor
	elif (options.start or options.stop or options.query):
		print 'error: missing required --reactor argument'
		sys.exit(1)
	elif (options.list):
		pass
	elif (options.stats):
		options.uristem = '/query/reactors'
	else:
		if (len(arguments) != 1):
			print 'error: No uri-stem argument was specified'
			sys.exit(1)
		options.uristem = arguments[0]
	# return argument data
	return options


def main():
	# parse command-line options
	options = parse_args()
	# establish connection to Pion server
	con = get_con(options)
	if (options.list):
		# retrieve a collection of reactor objects from pion config
		reactors = get_reactors(con, options)
		reactors.sort()
		for r in reactors:
			if (options.list == r.type or options.list == 'all'):
				print r.id, '=', r
				if (options.stats):
					get_stats(con, options, r)
					print "  Running=%s, EventsIn=%s, EventsOut=%s" % (
						r.running, r.events_in, r.events_out )
	else:
		# retrieve and display resource from Pion server
		r = get_response(con, options.uristem, options.headers)
		print_response(r)
	# close the HTTP connection
	con.close()


# call main() if script is being executed	
if __name__ == '__main__':
	main()
