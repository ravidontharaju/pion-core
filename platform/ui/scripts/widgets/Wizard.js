dojo.provide("pion.widgets.Wizard");
dojo.require("dojox.widget.Wizard");

dojo.declare("pion.widgets.Wizard",
	[ dojox.widget.Wizard ],
	{
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		},
		placeholder: function() {
		}
	}
);

pion.widgets.Wizard.exitEarly = function() {
	pion.wizardDone(true);
}

pion.widgets.Wizard.prepareLicensePane = function() {
	// When coming from the previous pane, always uncheck the check box,
	// so that the user has to click on it to proceed.
	dijit.byId('license_accept_checkbox').attr('checked', false);

	if (pion.edition == 'Core') {
		dojo.byId('atomic_enterprise_license').style.display = 'none';
		dojo.byId('gpl_affero_license').style.display = 'block';
	} else {
		dojo.byId('atomic_enterprise_license').style.display = 'block';
		dojo.byId('gpl_affero_license').style.display = 'none';
	}

	return true;
}

pion.widgets.Wizard.checkLicenseAccepted = function() {
	if (dijit.byId('license_accept_checkbox').attr('checked')) {

		if (pion.edition == 'Core') {
			pion.widgets.Wizard.exitEarly();
		}

		return true;
	}
	else
		return pion.wizard_nlsStrings.license_checkbox_not_checked_message;
}

pion.widgets.Wizard.getArrayFromCSVString = function(csv_str) {
	var raw_pieces = csv_str.split(',');

	// Get rid of white space.
	var trimmed_pieces = dojo.map(raw_pieces, function(item) {return dojo.trim(item);});

	// Save everything that's not an empty string.
	return dojo.filter(trimmed_pieces, function(item) {return item != '';});
}

pion.widgets.Wizard.checkHosts = function() {
	var raw_host_suffixes = dijit.byId('host_suffixes').attr('value').split(',');

	// Get rid of white space.
	var trimmed_hosts = dojo.map(raw_host_suffixes, function(item) {return dojo.trim(item);});

	// Save everything that's not an empty string.
	pion.wizard.host_suffixes = dojo.filter(trimmed_hosts, function(item) {return item != '';});

	// If the user didn't specify any hosts, skip over the cookie pane.
	// TODO: Does it make sense to have cookies without hosts?  What about hosts without cookies?
	if (pion.wizard.host_suffixes.length == 0) {
		dijit.byId('wizard').selectChild(dijit.byId('analytics_provider_pane'));
		return false;
	} else
		return true;
}

pion.widgets.Wizard.checkCookies = function() {
	pion.wizard.cookies = [];
	var visitor_cookies = pion.widgets.Wizard.getArrayFromCSVString(dijit.byId('visitor_cookies').attr('value'));
	dojo.forEach(visitor_cookies, function(cookie) {
		pion.wizard.cookies.push({name: cookie, is_visitor_cookie: true});
	});
	var session_cookies = pion.widgets.Wizard.getArrayFromCSVString(dijit.byId('session_cookies').attr('value'));
	dojo.forEach(session_cookies, function(cookie) {
		pion.wizard.cookies.push({name: cookie, is_visitor_cookie: false});
	});
	return true;
}

pion.widgets.Wizard.checkAnalyticsProvider = function() {
	pion.wizard.analytics_provider = dijit.byId('select_analytics_provider_form').attr('value').analytics_provider;

	switch (pion.wizard.analytics_provider) {
		case 'Omniture':
			pion.wizard.selectChild(dijit.byId('omniture_pane'));
			pion.wizard.analytics_provider_label = pion.wizard_nlsStrings.omniture_label;
			break;
		case 'Webtrends':
			pion.wizard.selectChild(dijit.byId('webtrends_pane'));
			pion.wizard.analytics_provider_label = pion.wizard_nlsStrings.webtrends_label;
			break;
		case 'Google':
			pion.wizard.selectChild(dijit.byId('google_pane'));
			pion.wizard.analytics_provider_label = pion.wizard_nlsStrings.google_label;
			break;
		case 'Unica':
			pion.wizard.selectChild(dijit.byId('unica_pane'));
			pion.wizard.analytics_provider_label = pion.wizard_nlsStrings.unica_label;
			break;
		default:
			pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
			pion.wizard.analytics_provider_label = 'None';
			break;
	}
	return false;
}

pion.widgets.Wizard.skipAnalyticsProvider = function() {
	pion.wizard.analytics_provider = '';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	pion.wizard.analytics_provider_label = 'None';
	return false;
}

pion.widgets.Wizard.checkOmnitureConfig = function() {
	pion.wizard.omniture_host = dojo.trim(dijit.byId('omniture_host').attr('value'));
	pion.wizard.omniture_report_suite = dojo.trim(dijit.byId('omniture_report_suite').attr('value'));
	if (pion.wizard.omniture_host == '')
		return 'You must specify a Host.';
	if (pion.wizard.omniture_report_suite == '')
		return 'You must specify a Report Suite.';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkWebtrendsConfig = function() {
	pion.wizard.webtrends_account_id = dojo.trim(dijit.byId('webtrends_account_id').attr('value'));
	pion.wizard.webtrends_host = dojo.trim(dijit.byId('webtrends_host').attr('value'));
	if (pion.wizard.webtrends_account_id == '')
		return 'You must specify an Account ID.';
	if (pion.wizard.webtrends_host == '')
		return 'You must specify a Host.';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkGoogleConfig = function() {
	pion.wizard.google_account_id = dojo.trim(dijit.byId('google_account_id').attr('value'));
	pion.wizard.google_host = dojo.trim(dijit.byId('google_host').attr('value'));
	if (pion.wizard.google_account_id == '')
		return 'You must specify an Account ID.';
	if (pion.wizard.google_host == '')
		return 'You must specify a Host.';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkUnicaConfig = function() {
	if ("OK")
		pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkCaptureDevices = function() {
	pion.wizard.devices = dijit.byId('device_list').attr('value').device_check_boxes;
	if (pion.wizard.devices.length == 0)
		return 'You must select at least one device.';
	return true;
}

pion.widgets.Wizard.checkPorts = function() {
	var form_values = dijit.byId('port_list').attr('value');
	pion.wizard.ports = pion.widgets.Wizard.getArrayFromCSVString(form_values.ports);
	if (pion.wizard.ports.length == 0)
		return 'You must enter at least one port.';
	return true;
}

pion.widgets.Wizard.checkSSLKeys = function() {
	if (pion.edition == 'Replay') {
		return true;
	} else {
		pion.widgets.Wizard.prepareSetupReview();
		pion.wizard.selectChild(dijit.byId('review_setup'));
		return false;
	}
}

pion.widgets.Wizard.checkReplaySetup = function() {
	var form_values = dijit.byId('replay_setup').attr('value');
	pion.wizard.max_disk_usage = form_values.max_disk_usage;
	pion.widgets.Wizard.prepareSetupReview();
}

pion.widgets.Wizard.prepareSetupReview = function() {
	dojo.byId('setup_review_form_edition').innerHTML = 'Pion ' + pion.edition;
	dojo.byId('setup_review_form_web_site').innerHTML = pion.wizard.host_suffixes.join(', ');
	dojo.byId('setup_review_form_web_analytics').innerHTML = pion.wizard.analytics_provider_label;
	dojo.byId('setup_review_form_cookies').innerHTML = dojo.map(pion.wizard.cookies, function(item) {return item.name;}).join(', ');
	dojo.byId('setup_review_form_devices').innerHTML = pion.wizard.devices.join(', ');
	dojo.byId('setup_review_form_ports').innerHTML = pion.wizard.ports.join(', ');
	dojo.byId('setup_review_form_ssl_keys').innerHTML = 'this is a placeholder';
	dojo.byId('setup_review_form_replay_alloc').innerHTML = pion.wizard.max_disk_usage;
}

pion.widgets.Wizard.deleteAllReactorsAndReload = function(reactors) {
	var num_reactors_deleted = 0;
	dojo.forEach(reactors, function(reactor) {
		var id = reactor.getAttribute('id');
		dojo.xhrDelete({
			url: '/config/reactors/' + id,
			handleAs: 'xml',
			timeout: 5000,
			load: function(response, ioArgs) {
				if (++num_reactors_deleted == reactors.length) {
					// Reload.  Since there are now no Reactors configured, the wizard will start.
					location.replace('/');
				}
				return response;
			},
			error: pion.getXhrErrorHandler(dojo.xhrDelete)
		});
	});
}

pion.widgets.Wizard.restart = function() {
	dojo.xhrGet({
		url: '/config/reactors',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			var reactors = response.getElementsByTagName('Reactor');
			if (reactors.length == 0) {
				// Reload.  Since there are no Reactors configured, the wizard will start.
				location.replace('/');
			} else {
				pion.services.getConfiguredServices().addCallback(function(kw_args) {
					var replay_configured = (dojo.indexOf(kw_args.configured_services, 'ReplayService') != -1);
					var message = 'Warning: You currently have '
								+ (reactors.length == 1? 'one Reactor ' : reactors.length + ' Reactors ')
								+ (replay_configured? 'and a Replay Service ' : '')
								+ 'configured.  If you continue, '
								+ (reactors.length == 1 && ! replay_configured? 'it ' : 'they ')
								+ 'will be deleted, and the Wizard will guide you through '
								+ 'creating a new configuration from scratch.  If you want to edit the configuration of a '
								+ 'particular Reactor, you can do so by double clicking on it in the Reactors '
								+ 'tab, or by editing reactors.xml.  '
								+ (replay_configured? 'The Replay Service can be edited by editing services.xml.  ' : '')
								+ 'Do you want to delete your current Reactors '
								+ (replay_configured? 'and Replay Service ' : '')
								+ 'and continue to the Wizard?';
					pion.doDeleteConfirmationDialog(message, pion.widgets.Wizard.deleteAllReactorsAndReload, reactors);
				});
			}
		},
		error: function(response, ioArgs) {
			pion.handleXhrGetError();
		}
	});
}

pion.widgets.Wizard.apply = function() {
	// TODO: move pion.wizardDone() here?
}