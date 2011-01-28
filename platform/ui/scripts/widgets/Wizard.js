dojo.provide("pion.widgets.Wizard");
dojo.require("dojox.widget.Wizard");
dojo.require("dojo.cookie");
dojo.require("pion.widgets.KeyStoreEditor");

dojo.declare("pion.widgets.Wizard",
	[ dojox.widget.Wizard ],
	{
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
		},
		start: function() {
			dojo.removeClass('wizard', 'hidden');
			document.body.appendChild(device_list_standby.domNode);
			device_list_standby.show();
			pion.wizard.cookies = [];
			pion.wizard.devices = [];
			pion.wizard.max_disk_usage = 'NA';

			new pion.widgets.KeyStoreEditor({}, 'key_store_editor');
		},
		placeholder: function() {
		}
	}
);

pion.widgets.Wizard.exitEarly = function() {
	pion.wizardDone(true);
}

pion.widgets.Wizard.checkLicenseKey = function() {
	var requested_product = 'Pion ' + pion.edition;
	var key = dojo.byId('license_key_text_area').value;
	if (key == '') {
		return 'You must enter a valid license key to use ' + requested_product + '.';
	}

	dojo.rawXhrPut({
		url: '/key',
		contentType: "text/plain",
		handleAs: "xml",
		putData: key,
		load: function(response) {
			pion.key_service_running = true;
			pion.about.checkKeyStatusDfd()
			.addCallback(function(license_key_type) {
				if (license_key_type == 'invalid') {
					dojo.byId('result_of_submitting_key').innerHTML = 'Invalid license key (may have expired).';
				} else {
					var products = dojo.map(response.getElementsByTagName('Product'), function(p) { return dojox.xml.parser.textContent(p) });
					if (dojo.indexOf(products, requested_product) == -1) {
						dojo.byId('result_of_submitting_key').innerHTML = 'Error: Key not valid for ' + requested_product + '.';
					} else {
						if (dojo.indexOf(products, 'Pion Replay') != -1) {
							pion.updateLicenseState('replay');
						} else if (dojo.indexOf(products, 'Pion Enterprise') != -1) {
							pion.updateLicenseState('enterprise');
						} else {
							pion.updateLicenseState('lite');
						}
						dojo.byId('license_key_text_area').value = '';
						dijit.byId('wizard').selectChild(dijit.byId('license_acceptance_pane'));
					}
				}
			});
			return response;
		},
		error: function(response, ioArgs) {
			dojo.byId('result_of_submitting_key').innerHTML = 'Error: Key not accepted.';
			return response;
		}
	});

	return false;
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

pion.widgets.Wizard.prepareHostPane = function() {
	if (! pion.widgets.Wizard.host_pane_initialized) {
		if (dojo.cookie('host_suffixes')) {
			dijit.byId('host_suffixes').attr('value', dojo.cookie('host_suffixes'));
		}
		pion.widgets.Wizard.host_pane_initialized = true;
	}
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
		var analytics_provider_pane = dijit.byId('analytics_provider_pane');
		analytics_provider_pane.returnPane = 'host_pane';
		dijit.byId('wizard').selectChild(analytics_provider_pane);
		return false;
	} else
		return true;
}

pion.widgets.Wizard.prepareCookiePane = function() {
	if (! pion.widgets.Wizard.cookie_pane_initialized) {
		if (dojo.cookie('visitor_cookies')) {
			dijit.byId('visitor_cookies').attr('value', dojo.cookie('visitor_cookies'));
		}
		if (dojo.cookie('session_cookies')) {
			dijit.byId('session_cookies').attr('value', dojo.cookie('session_cookies'));
		}
		pion.widgets.Wizard.cookie_pane_initialized = true;
	}
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

pion.widgets.Wizard.prepareAnalyticsProviderPane = function() {
	if (! pion.widgets.Wizard.analytics_provider_pane_initialized) {
		if (dojo.cookie('analytics_provider')) {
			dijit.byId('select_analytics_provider_form').attr('value', {analytics_provider: dojo.cookie('analytics_provider')});
		}
		pion.widgets.Wizard.analytics_provider_pane_initialized = true;
	}
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

pion.widgets.Wizard.prepareOmniturePane = function() {
	if (! pion.widgets.Wizard.omniture_pane_initialized) {
		if (dojo.cookie('omniture_host')) {
			dijit.byId('omniture_host').attr('value', dojo.cookie('omniture_host'));
		}
		if (dojo.cookie('omniture_report_suite')) {
			dijit.byId('omniture_report_suite').attr('value', dojo.cookie('omniture_report_suite'));
		}
		if (dojo.cookie('strip_client_ip')) {
			dijit.byId('omniture_strip_cip_checkbox').attr('checked', dojo.cookie('strip_client_ip') == 'true');
		}
		pion.widgets.Wizard.omniture_pane_initialized = true;
	}
}

pion.widgets.Wizard.checkOmnitureConfig = function() {
	pion.wizard.omniture_host = dojo.trim(dijit.byId('omniture_host').attr('value'));
	pion.wizard.omniture_report_suite = dojo.trim(dijit.byId('omniture_report_suite').attr('value'));
	if (pion.wizard.omniture_host == '')
		return 'You must specify a Host.';
	if (pion.wizard.omniture_report_suite == '')
		return 'You must specify a Report Suite.';
	pion.wizard.strip_client_ip = dijit.byId('omniture_strip_cip_checkbox').attr('checked')? 'true' : 'false';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.prepareWebtrendsPane = function() {
	if (! pion.widgets.Wizard.webtrends_pane_initialized) {
		if (dojo.cookie('webtrends_account_id')) {
			dijit.byId('webtrends_account_id').attr('value', dojo.cookie('webtrends_account_id'));
		}
		if (dojo.cookie('webtrends_host')) {
			dijit.byId('webtrends_host').attr('value', dojo.cookie('webtrends_host'));
		}
		if (dojo.cookie('strip_client_ip')) {
			dijit.byId('webtrends_strip_cip_checkbox').attr('checked', dojo.cookie('strip_client_ip') == 'true');
		}
		pion.widgets.Wizard.webtrends_pane_initialized = true;
	}
}

pion.widgets.Wizard.checkWebtrendsConfig = function() {
	pion.wizard.webtrends_account_id = dojo.trim(dijit.byId('webtrends_account_id').attr('value'));
	pion.wizard.webtrends_host = dojo.trim(dijit.byId('webtrends_host').attr('value'));
	if (pion.wizard.webtrends_account_id == '')
		return 'You must specify an Account ID.';
	if (pion.wizard.webtrends_host == '')
		return 'You must specify a Host.';
	pion.wizard.strip_client_ip = dijit.byId('webtrends_strip_cip_checkbox').attr('checked')? 'true' : 'false';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.prepareGooglePane = function() {
	if (! pion.widgets.Wizard.google_pane_initialized) {
		if (dojo.cookie('google_account_id')) {
			dijit.byId('google_account_id').attr('value', dojo.cookie('google_account_id'));
		}
		if (dojo.cookie('strip_client_ip')) {
			dijit.byId('google_strip_cip_checkbox').attr('checked', dojo.cookie('strip_client_ip') == 'true');
		}
		pion.widgets.Wizard.google_pane_initialized = true;
	}
}

pion.widgets.Wizard.checkGoogleConfig = function() {
	pion.wizard.google_account_id = dojo.trim(dijit.byId('google_account_id').attr('value'));
	if (pion.wizard.google_account_id == '')
		return 'You must specify an Account ID.';
	pion.wizard.strip_client_ip = dijit.byId('google_strip_cip_checkbox').attr('checked')? 'true' : 'false';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.prepareUnicaPane = function() {
	if (! pion.widgets.Wizard.unica_pane_initialized) {
		if (dojo.cookie('unica_account_id')) {
			dijit.byId('unica_account_id').attr('value', dojo.cookie('unica_account_id'));
		}
		if (dojo.cookie('unica_host')) {
			dijit.byId('unica_host').attr('value', dojo.cookie('unica_host'));
		}
		if (dojo.cookie('strip_client_ip')) {
			dijit.byId('unica_strip_cip_checkbox').attr('checked', dojo.cookie('strip_client_ip') == 'true');
		}
		pion.widgets.Wizard.unica_pane_initialized = true;
	}
}

pion.widgets.Wizard.checkUnicaConfig = function() {
	pion.wizard.unica_account_id = dojo.trim(dijit.byId('unica_account_id').attr('value'));
	pion.wizard.unica_host = dojo.trim(dijit.byId('unica_host').attr('value'));
	if (pion.wizard.unica_account_id == '')
		return 'You must specify a Site.';
	if (pion.wizard.unica_host == '')
		return 'You must specify a Host.';
	pion.wizard.strip_client_ip = dijit.byId('unica_strip_cip_checkbox').attr('checked')? 'true' : 'false';
	pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.prepareCaptureDevicesPane = function() {
	if (! pion.widgets.Wizard.capture_devices_pane_initialized) {
		// Create a temporary dummy SnifferReactor.
		var post_data = '<PionConfig><Reactor>'
			+ '<Plugin>SnifferReactor</Plugin>'
			+ '<Workspace>dummy</Workspace>'
			+ '<Protocol>' + pion.protocols.default_id + '</Protocol>'
			+ '</Reactor></PionConfig>';  
		dojo.rawXhrPost({
			url: '/config/reactors',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				var node = response.getElementsByTagName('Reactor')[0];
				var id = node.getAttribute('id');

				// Create an XML data store with all available interfaces, then use them to populate the Capture Devices pane.
				var interface_xml_store = new dojox.data.XmlStore({url: '/query/reactors/' + id + '/interfaces'});
				var device_list_div = dojo.byId('device_list');
				var selected_interfaces = dojo.cookie('selected_interfaces')? dojo.cookie('selected_interfaces').split(',') : [];
				interface_xml_store.fetch({
					query: {tagName: 'Interface'},
					onItem: function(item) {
						var device_name = interface_xml_store.getValue(item, 'Name');
						var description = interface_xml_store.getValue(item, 'Description');
						if (! description)
							description = '';

						var check_box_div = document.createElement('div');
						device_list_div.appendChild(check_box_div);
						var was_included = (dojo.indexOf(selected_interfaces, device_name) != -1);
						new dijit.form.CheckBox({name: 'device_check_boxes', value: device_name, checked: was_included}, check_box_div);
						var device_label = dojo.create('span', {innerHTML: device_name});
						dojo.addClass(device_label, 'device_name');
						device_list_div.appendChild(device_label);
						device_list_div.appendChild(dojo.create('br'));
						var description_div = dojo.create('div', {innerHTML: description});
						dojo.addClass(description_div, 'device_description');
						device_list_div.appendChild(description_div);
						device_list_div.appendChild(dojo.create('br'));
						pion.wizard.device_found = true;
					},
					onComplete: function() {
						device_list_standby.hide();

						// Delete the dummy SnifferReactor.
						dojo.xhrDelete({
							url: '/config/reactors/' + id,
							handleAs: 'xml',
							timeout: 5000,
							load: function(response, ioArgs) {
								return response;
							},
							error: pion.getXhrErrorHandler(dojo.xhrDelete)
						});
						if (! pion.wizard.device_found) {
							device_list_div.innerHTML = 'Error: no capture devices found.  Pion must be run as the root/administrator user.';
						}
						pion.widgets.Wizard.capture_devices_pane_initialized = true;
					}
				});
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	}
}

pion.widgets.Wizard.checkCaptureDevices = function() {
	if (! pion.wizard.device_found)
		return 'Error: no capture devices found.';
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
	pion.wizard.ssl_keys = [];
	pion.widgets.key_store.fetch({
		onItem: function(item) {
			var key_name = pion.widgets.key_store.getValue(item, 'Name');
			pion.wizard.ssl_keys.push(key_name);
		},
		onComplete: function() {
			if (pion.edition != 'Replay') {
				pion.widgets.Wizard.prepareSetupReview();
				pion.wizard.selectChild(dijit.byId('review_setup'));
			}
		},
		onError: pion.handleFetchError
	});
	if (pion.edition == 'Replay') {
		return true; // Proceed to next pane.
	} else {
		return false; // Don't proceed now, but in onComplete(), will go to final pane. 
	}
}

pion.widgets.Wizard.prepareReplaySetupPane = function() {
	if (! pion.widgets.Wizard.replay_setup_pane_initialized) {
		if (dojo.cookie('max_disk_usage')) {
			dijit.byId('replay_setup').attr('value', {max_disk_usage: dojo.cookie('max_disk_usage')});
		}
		pion.widgets.Wizard.replay_setup_pane_initialized = true;
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
	dojo.byId('setup_review_form_ssl_keys').innerHTML = pion.wizard.ssl_keys.join(', ');
	dojo.byId('setup_review_form_replay_alloc').innerHTML = pion.wizard.max_disk_usage;
}

pion.widgets.Wizard.deleteAllReactorsAndReload = function(reactors) {
	var num_reactors_deleted = 0;
	var getContent = function(p) { return dojox.xml.parser.textContent(p) };

	// Will be overwritten in the switch below if there is a wizard created Analytics Reactor configured.
	dojo.cookie('analytics_provider', 'none', {expires: 5000}); // 5000 days

	dojo.forEach(reactors, function(reactor) {
		// If this Reactor was created by the Wizard, before deleting it, use cookies to save various 
		// configuration values that can be used to pre-populate the Wizard.
		var sources = dojo.map(reactor.getElementsByTagName('Source'), getContent);
		if (sources.length && sources[0] == 'Wizard') {
			var plugin = dojox.xml.parser.textContent(reactor.getElementsByTagName('Plugin')[0]);
			switch (plugin) {
				case 'ClickstreamReactor':
					var host_suffixes = [];
					var session_cookies = [];
					var visitor_cookies = [];

					// Get the index of the first non-default session group, if one exists.
					var session_groups = reactor.getElementsByTagName('SessionGroup');
					for (i = 0; i < session_groups.length && session_groups[i].getAttribute('id') == 'default'; ++i);

					// Get the hosts and cookies from the first non-default session group, if one exists.
					if (i < session_groups.length) {
						var first_non_default_session_group = session_groups[i];
						host_suffixes = dojo.map(first_non_default_session_group.getElementsByTagName('Host'), getContent);
						dojo.forEach(first_non_default_session_group.getElementsByTagName('Cookie'), function(cookie) {
							var type = cookie.getAttribute('type');
							if (type) {
								if (type.indexOf('s') != -1)
									session_cookies.push(getContent(cookie));
								if (type.indexOf('v') != -1)
									visitor_cookies.push(getContent(cookie));
							}
						});
					}

					dojo.cookie('host_suffixes', host_suffixes.join(', '), {expires: 5000}); // 5000 days
					dojo.cookie('session_cookies', session_cookies.join(', '), {expires: 5000}); // 5000 days
					dojo.cookie('visitor_cookies', visitor_cookies.join(', '), {expires: 5000}); // 5000 days
					break;
				case 'OmnitureAnalyticsReactor':
					dojo.cookie('analytics_provider', 'Omniture', {expires: 5000}); // 5000 days
					dojo.cookie('omniture_host', getContent(reactor.getElementsByTagName('HttpHost')[0]));
					dojo.cookie('omniture_report_suite', getContent(reactor.getElementsByTagName('AccountId')[0]));
					dojo.cookie('strip_client_ip', getContent(reactor.getElementsByTagName('StripClientIP')[0]));
					break;
				case 'WebTrendsAnalyticsReactor':
					dojo.cookie('analytics_provider', 'Webtrends', {expires: 5000}); // 5000 days
					dojo.cookie('webtrends_account_id', getContent(reactor.getElementsByTagName('AccountId')[0]));
					dojo.cookie('webtrends_host', getContent(reactor.getElementsByTagName('HttpHost')[0]));
					dojo.cookie('strip_client_ip', getContent(reactor.getElementsByTagName('StripClientIP')[0]));
					break;
				case 'GoogleAnalyticsReactor':
					dojo.cookie('analytics_provider', 'Google', {expires: 5000}); // 5000 days
					dojo.cookie('google_account_id', getContent(reactor.getElementsByTagName('AccountId')[0]));
					dojo.cookie('strip_client_ip', getContent(reactor.getElementsByTagName('StripClientIP')[0]));
					break;
				case 'UnicaAnalyticsReactor':
					dojo.cookie('analytics_provider', 'Unica', {expires: 5000}); // 5000 days
					dojo.cookie('unica_account_id', getContent(reactor.getElementsByTagName('AccountId')[0]));
					dojo.cookie('unica_host', getContent(reactor.getElementsByTagName('HttpHost')[0]));
					dojo.cookie('strip_client_ip', getContent(reactor.getElementsByTagName('StripClientIP')[0]));
					break;
				case 'SnifferReactor':
					var selected_interfaces = dojo.map(reactor.getElementsByTagName('Interface'), getContent);
					dojo.cookie('selected_interfaces', selected_interfaces.join(','), {expires: 5000}); // 5000 days
					break;
				case 'MultiDatabaseReactor':
					dojo.cookie('max_disk_usage', getContent(reactor.getElementsByTagName('MaxDiskUsage')[0]));
					break;
			}
		}

		var id = reactor.getAttribute('id');
		dojo.xhrDelete({
			url: '/config/reactors/' + id,
			handleAs: 'xml',
			timeout: 5000,
			load: function(response, ioArgs) {
				if (++num_reactors_deleted == reactors.length) {
					pion.widgets.Wizard.deleteAllWorkspacesAndReload();
				}
				return response;
			},
			error: pion.getXhrErrorHandler(dojo.xhrDelete)
		});
	});
}

pion.widgets.Wizard.deleteAllWorkspacesAndReload = function() {
	pion.reactors.deleteAllWorkspaces()
	.addCallback(function() {
		// Delete the pion_edition cookie.
		dojo.cookie('pion_edition', '', {expires: -1});

		// Reload.  Since there are now no Reactors configured and no pion_edition cookie, the wizard will start.
		location.replace('/');
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
				pion.widgets.Wizard.deleteAllWorkspacesAndReload();
			} else {
				pion.services.getConfiguredServices().addCallback(function(kw_args) {
					var replay_configured = dojo.some(kw_args.configured_services, function(service) {
						return service.plugin == 'ReplayService';
					});
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
		error: pion.handleXhrGetError
	});
}

pion.widgets.Wizard.apply = function() {
	// TODO: move pion.wizardDone() here?
}