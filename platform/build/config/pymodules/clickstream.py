# clickstream.py: simple python module for clickstream processing
#
# Copyright (c) 2010-2011 Atomic Labs, Inc.  All Rights Reserved.

class beacons:
	"""Tracks event sequences within clickstream visitor sessions"""
	def __init__(self, reactor):
		self.reactor = reactor
		self.beacons = []
	def add(self, term, callback):
		beacon = (term, callback)
		self.beacons.append(beacon)
	def clear(self):
		self.beacons.clear()
	def process(self, e):
		session = self.reactor.getsession(e)
		set_beacon = False
		if (self.beacons):
			for b in self.beacons:
				new_tag = b[1](self.reactor, e)
				if (new_tag):
					if (not isinstance(new_tag, str)):
						raise TypeError("beacon functions must return str")
					if (hasattr(session, 'beacons')):
						current_tag = session.beacons.get(b[0], None)
						new_tag = current_tag + ' ' + new_tag
					else:
						session.beacons = dict()
					session.beacons[b[0]] = new_tag
					set_beacon = True
		if (hasattr(session, 'beacons')):
			for term, value in session.beacons.items():
				e[term] = value
		return set_beacon