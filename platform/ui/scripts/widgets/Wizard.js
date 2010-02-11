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
	// TODO: allow more than one cookie.
	var cookie_1 = dijit.byId('cookie_1').attr('value');
	var is_visitor_cookie = dijit.byId('is_visitor_cookie').attr('checked');
	pion.wizard.cookies = [
		{name: cookie_1, is_visitor_cookie: is_visitor_cookie}
	];
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

pion.widgets.Wizard.checkOmnitureConfig = function() {
	pion.wizard.omniture_host = dojo.trim(dijit.byId('omniture_host').attr('value'));
	pion.wizard.omniture_report_suite = dojo.trim(dijit.byId('omniture_report_suite').attr('value'));
	if ("OK")
		pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkWebtrendsConfig = function() {
	if ("OK")
		pion.wizard.selectChild(dijit.byId('capture_devices_pane'));
	return false;
}

pion.widgets.Wizard.checkGoogleConfig = function() {
	pion.wizard.google_account_id = dijit.byId('google_account_id').attr('value');
	if ("OK")
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
	return true;
}

pion.widgets.Wizard.checkPorts = function() {
	var form_values = dijit.byId('port_list').attr('value');

	pion.wizard.unencrypted_ports = pion.widgets.Wizard.getArrayFromCSVString(form_values.unencrypted_ports);
	pion.wizard.encrypted_ports = pion.widgets.Wizard.getArrayFromCSVString(form_values.encrypted_ports);
	pion.wizard.ports = pion.wizard.unencrypted_ports.concat(pion.wizard.encrypted_ports);

	if (pion.wizard.encrypted_ports.length == 0) {
		if (pion.edition == 'Replay')
			pion.wizard.selectChild(dijit.byId('setup_replay'));
		else {
			pion.widgets.Wizard.prepareSetupReview();
			pion.wizard.selectChild(dijit.byId('review_setup'));
		}
		return false;
	}

	// If there are any encrypted ports, then we just go to the next pane (to configure the SSL keys).
	return true;
}

pion.widgets.Wizard.saveKey = function() {
	var form_values = dijit.byId('ssl_key_setup').attr('value');
	var ssl_key_input = dojo.byId('ssl_key_input');
	var post_data = '<PionConfig><Key>';
	post_data += pion.makeXmlLeafElement('Name', form_values.name);
	post_data += pion.makeXmlLeafElement('PEM', ssl_key_input.value);
	post_data += '</Key></PionConfig>';

	// Clear the fields.
	dijit.byId('ssl_key_setup').attr('value', {name: ''});
	ssl_key_input.value = '';

	dojo.rawXhrPost({
		url: '/keystore',
		contentType: "text/xml",
		handleAs: "xml",
		postData: post_data,
		load: function(response) {
			return response;
		},
		error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
	});
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

pion.widgets.Wizard.wizardDone = function() {
	// TODO: move pion.wizardDone() here?
}