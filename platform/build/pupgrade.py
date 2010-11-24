#!/usr/bin/python
# --------------------------------------
# pion configuration file upgrade script
# --------------------------------------

# Import libraries used by this script
import sys, os, re, shutil, optparse, xml.dom.minidom, uuid

# Base class used for configuration upgrade logic
class UpgradeRule(object):
	"""Class used to hold version upgrade logic"""
	def __init__(self, version, regex):
		self.version = version
		self.regex = regex
	def start(self, config):
		"""this is always called before process and regardless of TEST"""
		if (not QUIET):
			print 'upgrading from ' + config.version + ' to ' + self.version
	def process(self, config):
		"""override this function to define upgrade logic - not called if TEST"""
		pass
	def finish(self, config):
		"""this is always called after process and regardless of TEST"""
		config.set_version(self.version)


# Global list of configuration upgrade rules
RULES = list()


###########################################
# KEEP THIS UPDATED TO THE LATEST VERSION #
###########################################
CURRENT_VERSION = '3.1.2'

########################################
# CONFIGURATION UPGRADE RULES GO BELOW #
#VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV#

class Upgrade30xTo31x(UpgradeRule):
	"""Upgrade from 3.0.x to 3.1.x"""
	def __init__(self, version, regex):
		UpgradeRule.__init__(self, version, regex)
	def update_users(self, user_cfg):
		users = user_cfg.doc.getElementsByTagName('User')
		for u in users:
			# get existing data
			if (VERBOSE): print 'Updating User configuration: ' + u.getAttribute('id')
			user_pw = u.getElementsByTagName('Password')[0].firstChild.data
			# remove all children
			while u.hasChildNodes():
				u.removeChild(u.firstChild)
			# add child back in for password
			u.appendChild(user_cfg.doc.createTextNode('\n\t\t'))
			password = user_cfg.doc.createElement('Password')
			password.appendChild(user_cfg.doc.createTextNode(user_pw))
			u.appendChild(password)
			# set Administrator permission
			u.appendChild(user_cfg.doc.createTextNode('\n\t\t'))
			permission = user_cfg.doc.createElement('Permission')
			permission.setAttribute('type', 'Admin')
			u.appendChild(permission)
			u.appendChild(user_cfg.doc.createTextNode('\n\t'))
		if (not QUIET): print 'WARNING: All users have be upgraded to Administrators.'
		if (not QUIET): print 'WARNING: Please use the web interface to update user permissions.'
	def update_reactors(self, reactor_cfg):
		root = reactor_cfg.doc.getElementsByTagName(reactor_cfg.root)[0]
		reactor_nodes = reactor_cfg.doc.getElementsByTagName('Reactor')
		workspace_nodes = reactor_cfg.doc.getElementsByTagName('Workspace')
		workspaces = dict()
		for w in reversed(workspace_nodes):
			# get name, check if we already have seen this workspace
			workspace_name = w.firstChild.data
			workspace_id = workspaces.get(workspace_name, None)
			if (not workspace_id):
				# generate a random id, and update map
				workspace_id = str(uuid.uuid4())
				workspaces[workspace_name] = workspace_id
				# create a workspace node
				new_node = reactor_cfg.doc.createElement('Workspace')
				new_node.setAttribute('id', workspace_id)
				name_node = reactor_cfg.doc.createElement('Name')
				name_node.appendChild(reactor_cfg.doc.createTextNode(workspace_name))
				new_node.appendChild(reactor_cfg.doc.createTextNode('\n    '))
				new_node.appendChild(name_node)
				new_node.appendChild(reactor_cfg.doc.createTextNode('\n  '))
				# add workspace node to doc tree
				root.insertBefore(new_node, root.firstChild)
				root.insertBefore(reactor_cfg.doc.createTextNode('\n  '), root.firstChild)
			# replace descriptive name with id
			while w.hasChildNodes():
				w.removeChild(w.firstChild)
			w.appendChild(reactor_cfg.doc.createTextNode(workspace_id))
	def process(self, config):
		self.update_users(config['UserConfig'])
		self.update_reactors(config['ReactorConfig'])

RULES.append(Upgrade30xTo31x('3.1.2', '^3\.0\..*$'))

# ...

#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^#
# CONFIGURATION UPGRADE RULES GO ABOVE #
########################################


# misc global variables for logging
VERBOSE = False
QUIET = False
TEST = False

class XMLConfig(object):
	"""Class used to hold XML configuration data"""
	def __init__(self, file, name, root = None):
		self.name = name
		if (root):
			self.root = root
		else:
			self.root = name
		self.file = file
		if (VERBOSE): print self.name + ': parsing XML configuration file: ' + self.file
		self.doc = xml.dom.minidom.parse(self.file)
		self.version = self.doc.getElementsByTagName(self.root)[0].getAttribute('pion_version')
	def get(self, name):
		"""returns the value of an XML element"""
		return self.doc.getElementsByTagName(name)[0].firstChild.data
	def backup(self, path):
		"""creates a backup of the configuration file"""
		if (VERBOSE): print self.name + ': backing up ' + self.file + ' to ' + path
		if (not TEST): shutil.copy(self.file, path)
	def save(self):
		"""saves updated configuration file"""
		if (VERBOSE): print self.name + ': saving ' + self.file
		if (not TEST):
			f = open(self.file, 'w')
			f.write(self.doc.toxml("utf-8"))
			f.close()
	def set_version(self, version):
		"""updates the configuration file version"""
		self.version = version
		self.doc.getElementsByTagName(self.root)[0].setAttribute('pion_version', self.version)

class PionConfig(dict):
	"""Class used to hold all Pion configuration data"""
	def __init__(self, config_path):
		self.config_path = config_path
		# start by parsing platform.xml in the config directory
		platform_cfg = self.parse('platform.xml', 'PionConfig')
		self.version = platform_cfg.version
		# parse the rest of the config files
		self.parse(platform_cfg.get('CodecConfig'), 'CodecConfig', 'PionConfig')
		self.parse(platform_cfg.get('DatabaseConfig'), 'DatabaseConfig', 'PionConfig')
		self.parse(platform_cfg.get('ReactorConfig'), 'ReactorConfig', 'PionConfig')
		self.parse( platform_cfg.get('ServiceConfig'), 'ServiceConfig', 'PionConfig')
		self.parse(platform_cfg.get('ProtocolConfig'), 'ProtocolConfig', 'PionConfig')
		self.parse(platform_cfg.get('UserConfig'), 'UserConfig', 'PionConfig')
		self.parse(platform_cfg.get('VocabularyConfig'), 'VocabularyConfig', 'PionConfig')
		# these use different root elements
		self.parse('robots.xml', 'RobotConfig')
		self.parse('SearchEngines.xml', 'SearchEngineConfig')
		self.parse('ReplayQueries.xml', 'ReplayTemplates')
		# other config options -> not XML files
		self.logconfig_file = os.path.join(self.config_path, platform_cfg.get('LogConfig'))
		self.plugin_path = os.path.join(self.config_path, platform_cfg.get('PluginPath'))
		self.data_dir = os.path.join(self.config_path, platform_cfg.get('DataDirectory'))
		if (VERBOSE):
			print 'log configuration file: ' + self.logconfig_file
			print 'path to plugin files: ' + self.plugin_path
			print 'data directory: ' + self.data_dir
			print 'current version: ' + self.version
	def parse(self, file, name, root = None):
		"""parses a standard Pion XML configuration file"""
		cfg = XMLConfig(os.path.join(self.config_path, file), name, root)
		self[name] = cfg
		return cfg
	def backup(self, backup_path):
		"""creates a backup of all configuration files"""
		if (not QUIET): print 'creating backups in ' + backup_path
		if (not TEST and not os.path.exists(backup_path)):
			os.makedirs(backup_path)
		for name, cfg in self.items():
			cfg.backup(backup_path)
	def save(self):
		"""saves updated configuration file"""
		if (not QUIET): print 'saving configuration files'
		for name, cfg in self.items():
			cfg.save()
	def set_version(self, version):
		"""updates the configuration file version"""
		self.version = version
		for name, cfg in self.items():
			cfg.set_version(self.version)
	def update_paths(self, new_path):
		"""updates paths for all configuration files"""
		for name, cfg in self.items():
			cfg.file = os.path.join(new_path, os.path.basename(cfg.file))
	

def parse_args():
	"""parses and returns command-line arguments"""
	# prepare argument parser
	parser = optparse.OptionParser(usage="usage: %prog [options] configpath")
	parser.add_option("-o", "--output", action="store", default=None,
		help="save updated configuration in this directory")
	parser.add_option("-t", "--test", action="store_true", default=False,
		help="test run only, do not modify (default=False)")
	parser.add_option("-v", "--verbose", action="store_true", default=False,
		help="enables verbose operation (default=False)")
	parser.add_option("-q", "--quiet", action="store_true", default=False,
		help="enables quiet operation (default=False)")
	# parse command-line arguments
	options, arguments = parser.parse_args()		
	# check validity of arguments
	if (len(arguments) != 1):
		print 'error: No configuration path argument was specified'
		sys.exit(1)
	options.config_path = arguments[0]
	return options


def main():
	"""main processing function"""
	global VERBOSE
	global QUIET
	global TEST
	# parse command-line options
	options = parse_args()
	VERBOSE = options.verbose
	QUIET = options.quiet
	TEST = options.test
	# get configuration
	config = PionConfig(options.config_path)
	current_version = config.version
	# process upgrade rules
	upgraded = False
	for r in RULES:
		# process a rule only if version patches pattern
		if (re.search(r.regex, config.version)):
			r.start(config)
			if (not TEST):
				r.process(config)
			r.finish(config)
			upgraded = True
	if (upgraded):
		# config was updated
		if (options.output):
			# save config to new output directory
			if (not TEST and not os.path.exists(options.output)):
				os.makedirs(options.output)
			config.update_paths(options.output)
		else:
			# make backup and overwrite config
			config.backup(os.path.join(config.config_path, 'backup-' + current_version))
		config.save()
	else:
		if (not QUIET): print 'configuration is up-to-date (' + current_version + ')'


# call main() if script is being executed	
if __name__ == '__main__':
	main()

