#!/usr/bin/python
# ---------------------------------------------
# pion cookie authentication HTTP query wrapper
# ---------------------------------------------

import sys, httplib, socket, optparse, re, xml.dom.minidom


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


def send_request(con, uristem, **args):
	# process args dictionary
	if ('method' in args):
		method = args['method']
	else:
		method = 'GET'
	if ('body' in args):
		body = args['body']
	else:
		body = ''
	if ('headers' in args):
		headers = args['headers']
	else:
		headers = {}
	# send the request	
	try:
		con.request(method, uristem, body, headers)
	except:
		print 'error: unable to establish connection to Pion server'
		sys.exit(1)
	# get the response
	r = con.getresponse()
	# check response status
	if (r.status == 401):
		print 'error: Unable to authenticate to Pion server'
		sys.exit(1)
	if (r.status >= 400 and r.status <= 599):
		print 'error: response =', r.status, r.reason
		sys.exit(1)
	# return the response
	return r


def print_response(r):
	body = r.read()
	if (body):
		ctype = r.getheader('Content-Type');
		if (ctype.lower().startswith('text/xml')):
			doc = xml.dom.minidom.parseString(body)
			print pretty_print(doc)
			#print doc.toprettyxml()
			doc.unlink()
		else:
			print body
	else:
		print "No response body ( status =", r.status, ')'


def get_cookie(con, user, password):
	r = send_request(con, '/login?user=' + user + '&pass=' + password)
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
		# set default connection timeout = 10 seconds
		# NOTE: this breaks SSL for Python < 2.5
		#       so only setting a timeout for non-SSL
		socket.setdefaulttimeout(10)
		con = httplib.HTTPConnection(options.server, options.port);
	# get session cookie
	options.cookie = get_cookie(con, options.user, options.password)
	options.headers = {'Cookie' : 'pion_session_id="' + options.cookie + '"'}
	return con


def get_reactors(con, options):
	# query reactor configuration
	r = send_request(con, '/config/reactors', headers=options.headers)
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
		name = comment = ''
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
	r = send_request(con, '/query/reactors/' + reactor.id, headers=options.headers)
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


def list_reactors(con, options):
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


def add_key(con, options):
	# prompt for key parameters
	print 'Adding a new RSA private key to keystore'
	key_name = ''
	while (not key_name):
		key_name = raw_input('Descriptive name: ')
	key_pem = ''
	while (not key_pem):
		key_file = raw_input('PEM-encoded file: ')
		if (not key_file):
			continue
		# open and read key file
		try:
			f = open(key_file, 'r')
			key_pem = f.read()
		except:
			print 'error: unable to read file:', key_file
			continue;
		# look for "RSA PRIVATE KEY"
		header_rx = re.compile(r'-----BEGIN\sRSA\sPRIVATE\sKEY-----')
		if (not header_rx.search(key_pem)):
			print 'error: file does not contain a PEM-encoded private key:', key_file
			key_pem = ''
	# prompt for optional password
	key_password = raw_input('Password (if set): ')
	# build XML document to represent the new key
	xml_doc = xml.dom.minidom.getDOMImplementation().createDocument(None, 'PionConfig', None)
	key_tag = xml_doc.createElement('Key');
	xml_doc.documentElement.appendChild(key_tag)
	# add Name element
	name_tag = xml_doc.createElement('Name');
	name_tag.appendChild( xml_doc.createTextNode(key_name) )
	key_tag.appendChild(name_tag)
	# add PEM element
	pem_tag = xml_doc.createElement('PEM');
	pem_tag.appendChild( xml_doc.createTextNode(key_pem) )
	key_tag.appendChild(pem_tag)
	if (key_password):
		# add Password element
		password_tag = xml_doc.createElement('Password');
		password_tag.appendChild( xml_doc.createTextNode(key_password) )
		key_tag.appendChild(password_tag)
	# send POST request to add the new RSA private key to the keystore
	r = send_request(con, '/keystore', body=xml_doc.toxml(), headers=options.headers, method='POST')
	print_response(r)


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
	parser.add_option("", "--listkeys", action="store_true", default=False,
		help="lists all RSA private keys in keystore")
	parser.add_option("", "--addkey", action="store_true", default=False,
		help="add a new RSA private key to keystore")
	parser.add_option("", "--removekey", action="store",
		help="removes specified RSA private key from keystore")
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
	elif (options.list or options.addkey or options.removekey):
		pass
	elif (options.listkeys):
		options.uristem = '/keystore'
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
		# display list of reactors
		list_reactors(con, options)
	elif (options.addkey):
		# add an RSA private key to keystore
		add_key(con, options)
	elif (options.removekey):
		# send DELETE request to remove RSA private key from keystore
		r = send_request(con, '/keystore/' + options.removekey, headers=options.headers, method='DELETE')
		if (r.status == 204):
			print 'Removed key', options.removekey
		else:
			print_response(r)
	else:
		# retrieve and display resource from Pion server
		r = send_request(con, options.uristem, headers=options.headers)
		print_response(r)
	# close the HTTP connection
	con.close()


# call main() if script is being executed	
if __name__ == '__main__':
	main()
