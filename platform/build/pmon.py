#!/usr/bin/python
# --------------------------
# pion server monitor script
# --------------------------

import pget, sys, time


# defines a mapping of reactor statistics to maximum threshold values
KEY_METRICS = {
	'DatabaseOutputReactor' : {
		'EventsQueued' : 7500,         # events queued for db inserts
		'KeyCacheSize' : 100000,       # recent index keys cached
		},
	'MultiDatabaseReactor' : {
		'EventsQueued' : 7000,	       # events queued for db inserts
		'KeyCacheSize' : 100000,       # recent index keys cached
		},
	'ClickstreamReactor' : {
		'OpenSessions' : 100000,       # open visitor sessions
		'OpenPages' : 10000,           # open page events
		'OpenEvents' : 100000,         # open request events
		'OpenOrphans' : 100000,        # open orphaned requests
		},
	'SessionFilterReactor' : {
		'OpenSessions' : 100000,       # open visitor sessions
		'OpenEvents' : 100000,         # events actively cached
		},
	'SnifferReactor' : {
		'BitsPerSecond' : 300000000,   # average bps for a capture device
		'PacketQueueSize' : 30000,     # packets waiting to be processed
		},
	}


class Metric:
	"""object that holds the status for an important metric"""
	def __init__(self, id, type, name, field, value, max):
		self.id = id
		self.type = type
		self.name = name
		self.field = field
		self.value = value
		self.max = max
	def __str__(self):
		return '%s(%s).%s = %d / %d' % (self.type, self.name, self.field, self.value, self.max)
	def __lt__(self, other):
		return self.type < other.type


def get_metrics(con, options, reactors):
	metrics = list()
	# retrieve stats for all reactors we want to monitor
	for r in reactors:
		if (not KEY_METRICS.has_key(r.type)):
			continue
		fieldmap = KEY_METRICS[r.type]
		pget.get_stats(con, options, r, fieldmap.keys())
		if (r.running == 'true'):
			for s in r.stats:
				metrics.append( Metric(r.id, r.type, r.name, s[0], int(s[1]), fieldmap[s[0]] ) )
	return metrics


def main():
	# parse command-line options
	parser = pget.get_arg_parser()
	parser.add_option("-i", "--interval", action="store", type="int", default="10",
		help="interval of time (in seconds) between Pion statistics requests")
	options, arguments = parser.parse_args()		
	# argument sanity check
	options.interval = None
	if (arguments):
		try:
			options.interval = int(arguments[0])
			if (options.interval < 1):
				options.interval = 1
		except:
			print 'error: bad interval argument'
			sys.exit(1)
	# establish connection to Pion server
	con = pget.get_con(options)
	# retrieve a collection of reactor objects from pion config
	reactors = pget.get_reactors(con, options)
	# main loop
	while (True):
		print "------------------------------------------"
		print '|', time.strftime("PION STATISTICS AT %Y-%m-%d %H:%M:%S"), '|'
		print "------------------------------------------"
		# retrieve stats for all reactors we want to monitor
		metrics = get_metrics(con, options, reactors)
		metrics.sort()
		for m in metrics:
			print m
		if (not options.interval):
			break
		# sleep a bit
		time.sleep(options.interval)
	# close the HTTP connection
	con.close()


# call main() if script is being executed	
if __name__ == '__main__':
	main()
