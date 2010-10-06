class Session:
	"""Represents an individual clickstream visitor session"""
	def __init__(self, id=''):
		self.session_id = id
		self.data = None

class SessionMap:
	"""Provides simple data persistence for clickstream sessions"""
	def __init__(self):
		self.sessions = dict()
		self.session_id_term = "urn:vocab:clickstream#session-id"
		self.session_end_term = "urn:vocab:clickstream#session-event"
	def erase(self, session_id):
		del self.sessions[session_id]
	def get(self, session_id):
		return self.sessions.get(session_id, None)
	def set(self, session_id, s):
		self.sessions[session_id] = s
	def getId(self, e):
		try: session_id = e[self.session_id_term][0]
		except: session_id = None
		return session_id
	def isCloseEvent(self, e):
		return (e.type == self.session_end_term);
	def prune(self, e):
		result = self.isCloseEvent(e)
		if (result):
			try: self.erase(self.getId(e))
			except: pass
		return result

class BeaconMap(SessionMap):
	"""Provides simple data persistence for clickstream sessions"""
	def __init__(self):
		SessionMap.__init__(self)
		self.beacons = []
	def addBeacon(self, term, match):
		beacon = (term, match)
		self.beacons.append(beacon)
	def clearBeacons(self):
		self.beacons.clear()
	def tag(self, session, e):
		if (session and session.data):
			for term, value in session.data.items():
				e[term] = [ value ]
	def process(self, e):
		session_id = self.getId(e)
		if (not session_id):
			return
		session = self.get(session_id)
		if (not self.prune(e) and self.beacons):
			for b in self.beacons:
				new_tag = b[1](e)
				if (new_tag):
					if (not session):
						session = Session(session_id)
						session.data = dict()
						session.data[b[0]] = new_tag
						self.set(session_id, session)
					else:
						current_tag = session.data[b[0]]
						if (current_tag):
							new_tag = current_tag + ' ' + new_tag
						session.data[b[0]] = new_tag
		self.tag(session, e)