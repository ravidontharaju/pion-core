#!/usr/bin/python
# --------------------------
# pion server monitor script
# --------------------------

import pget, sys, time, commands, smtplib


# these parameters control how email alert messages are sent
SMTP_SENDER = 'pion@localhost'
SMTP_SERVER = 'localhost'
SMTP_PORT = 25
SMTP_USER = ''
SMTP_PASSWORD = ''


# defines a mapping of reactor statistics to maximum threshold values
KEY_METRICS = {
	'DatabaseOutputReactor' : {
		'EventsQueued' : 7500,                  # events queued for db inserts
		'KeyCacheSize' : 100000,                # recent index keys cached
		},
	'MultiDatabaseReactor' : {
		'EventsQueued' : 7500,	                # events queued for db inserts
		'KeyCacheSize' : 100000,                # recent index keys cached
		'CurrentTotalSessions' : 100000,        # events queued for db inserts
		'CurrentActiveSessions' : 100000,       # recent index keys cached
		'PreviousActiveSessions' : 100000,      # recent index keys cached
		},
	'ClickstreamReactor' : {
		'SessionCookies' : 100000,              # cookie id's mapped to sessions
		'AnonSessions' : 100000,                # anonymous visitor sessions
		'OpenSessions' : 100000,                # open visitor sessions
		'OpenPages' : 25000,                    # open page events
		'OpenEvents' : 100000,                  # open request events
		'OpenOrphans' : 100000,                 # open orphaned requests
		},
	'SessionFilterReactor' : {
		'OpenSessions' : 100000,                # open visitor sessions
		'OpenEvents' : 250000,                  # events actively cached
		},
	'SnifferReactor' : {
		'BitsPerSecond' : 300000000,            # average bps for a capture device
		'PacketQueueSize' : 30000,              # packets waiting to be processed
		'TcpSessionCount' : 100000,             # open tcp connections
		'SslSessionKeyCount' : 100000,          # cached SSL session keys
		'TcpReassemblyPacketCount' : 500000,    # packets waiting to be processed
		'TcpReassemblyPayloadSize' : 100000000, # total bytes in packets waiting
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


def send_email(recipients, last_metrics, msg):
	s = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
	if (SMTP_USER != ''):
		s.login(SMTP_USER, SMTP_PASSWORD)
	contents = 'From: ' + SMTP_SENDER + '\nTo: ' + recipients + '\nSubject: pmon alert: ' + msg + '\n\n' + last_metrics
	result = s.sendmail(SMTP_SENDER, recipients, contents)
	if (result):
		errmsg = "Unable to send email to %s" % recipients
		raise smtplib.SMTPException, errmsg


def main():
	# parse command-line options
	parser = pget.get_arg_parser()
	parser.add_option("-c", "--command", action="store",
		help="command to execute at the end of each interval")
	parser.add_option("-e", "--email", action="store",
		help="email address(es) to which alerts will be sent")
	parser.add_option("", "--restart", action="store",
		help="command executed to restart Pion if connection is lost")
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
	# main loop
	initialized = False
	restarting = False
	while (True):
		if (not initialized):
			last_metrics = ""
			last_metrics_error = False
			try:
				# establish connection to Pion server
				con = pget.get_con(options)
				# retrieve a collection of reactor objects from pion config
				reactors = pget.get_reactors(con, options)
			except KeyboardInterrupt:
				raise
			except:
				if (restarting):
					print 'FATAL: unable to restart Pion server!'
					if (options.email):
						send_email(options.email, last_metrics, 'unable to restart Pion server!')
				raise
			initialized = True
			restarting = False
		# retrieve stats for all reactors we want to monitor
		try:
			metrics = get_metrics(con, options, reactors)
		except KeyboardInterrupt:
			raise
		except:
			if (last_metrics == ""):
				raise
			print 'error: lost connection to Pion server!'
			if (options.restart):
				result = commands.getoutput(options.restart)
				if (options.email):
					try:
						send_email(options.email, last_metrics, 'lost connection, restarting Pion!')
					except KeyboardInterrupt:
						raise
					except:
						# don't shutdown just because email fails
						print 'error: unable to send alert email'
				# wait for pion to finish starting up
				time.sleep(options.interval)
				# force re-initialization
				initialized = False
				restarting = True
				continue
			elif (options.email):
				send_email(options.email, last_metrics, 'lost connection to Pion server!')
			sys.exit(1)
		metrics.sort()
		# generate summary of metrics collected
		last_metrics = "------------------------------------------\n"
		last_metrics += '| ' + time.strftime("PION STATISTICS AT %Y-%m-%d %H:%M:%S") + ' |\n'
		last_metrics += "------------------------------------------\n"
		metrics_error = False
		for m in metrics:
			if (m.value > m.max):
				metrics_error = True
				last_metrics += '*'
			last_metrics += str(m) + '\n'
		if (options.command):
			last_metrics += '\n' + commands.getoutput(options.command)
		# display summary
		print last_metrics
		# handle metrics out of range
		if (options.email):
			if (metrics_error):
				if (not last_metrics_error):
					send_email(options.email, last_metrics, 'metrics range exceeded!')
			elif (last_metrics_error):
				send_email(options.email, last_metrics, 'metrics returned to normal')
			last_metrics_error = metrics_error
		# all done if no interval defined
		if (not options.interval):
			break
		# sleep a bit
		time.sleep(options.interval)


# call main() if script is being executed	
if __name__ == '__main__':
	main()
