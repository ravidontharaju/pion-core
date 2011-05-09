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
			pion.wizard_nlsStrings = dojo.i18n.getLocalization("pion", "wizard");

			// TODO: It will take a lot more refactoring, but eventually all instances of pion.wizard.X should become this.X.
			pion.wizard = this;
		},
		start: function(license_key_type) {
			dojo.removeClass('wizard', 'hidden');
			dijit.byId('wizard').resize();
			document.body.appendChild(device_list_standby.domNode);
			device_list_standby.show();
			pion.wizard.cookies = [];
			pion.wizard.devices = [];
			pion.wizard.dashboards = [];
			pion.wizard.max_disk_usage = 'NA';

			new pion.widgets.KeyStoreEditor({}, 'key_store_editor');

			dijit.byId('review_setup').doneFunction = dojo.hitch(this, 'finish');

			// Any workspaces must be empty, and the wizard will make its own workspace, so delete them.
			pion.reactors.deleteAllWorkspaces();

			// Since there are no reactors configured, any ReplayService that is configured is useless, so delete it.
			pion.services.config_store.fetch({
				onItem: function(item) {
					var plugin = pion.services.config_store.getValue(item, 'Plugin');
					if (plugin == 'ReplayService') {
						var id = pion.services.config_store.getValue(item, '@id');
						dojo.xhrDelete({
							url: '/config/services/' + id,
							handleAs: 'xml',
							timeout: 5000,
							load: function(response, ioArgs) {
								return response;
							},
							error: pion.getXhrErrorHandler(dojo.xhrDelete)
						});
					}
				},
				onError: pion.handleFetchError
			});

			// This doesn't work: for some reason, it makes the radio buttons unselectable.
			//var template = dojo.byId('select_analytics_provider_form').innerHTML;
			//dojo.byId('select_analytics_provider_form').innerHTML = dojo.string.substitute(
			//	template, pion.wizard_nlsStrings
			//);
			dojo.forEach(dojo.query('label', dojo.byId('select_analytics_provider_form')), function(node) {
				node.innerHTML = dojo.string.substitute(node.innerHTML, pion.wizard_nlsStrings);
			});

			// Pre-select an edition if a pion_edition cookie is found, or failing that, a license key.
			if (dojo.cookie('pion_edition')) {
				pion.edition = dojo.cookie('pion_edition');
				dijit.byId('select_edition_form').attr('value', {edition: pion.edition});
			} else if (license_key_type == 'enterprise') {
				dijit.byId('select_edition_form').attr('value', {edition: 'Enterprise'});
			} else if (license_key_type == 'replay') {
				dijit.byId('select_edition_form').attr('value', {edition: 'Replay'});
			}

			// Assign next-button label for page 1 (which was already selected).
			var _this = this;
			var first_page = this.selectedChildWidget;
			dojo.forEach(dojo.query('.next_button', first_page.domNode), function(node) {
				_this.nextButton.attr('label', node.innerHTML);
			});

			dijit.byId('license_acceptance_pane').init = pion.widgets.Wizard.prepareLicensePane;
			dijit.byId('host_pane').init = pion.widgets.Wizard.prepareHostPane;
			dijit.byId('cookie_pane').init = pion.widgets.Wizard.prepareCookiePane;
			dijit.byId('analytics_provider_pane').init = pion.widgets.Wizard.prepareAnalyticsProviderPane;
			dijit.byId('omniture_pane').init = pion.widgets.Wizard.prepareOmniturePane;
			dijit.byId('webtrends_pane').init = pion.widgets.Wizard.prepareWebtrendsPane;
			dijit.byId('google_pane').init = pion.widgets.Wizard.prepareGooglePane;
			dijit.byId('unica_pane').init = pion.widgets.Wizard.prepareUnicaPane;
			dijit.byId('capture_devices_pane').init = pion.widgets.Wizard.prepareCaptureDevicesPane;
			dijit.byId('replay_setup_pane').init = pion.widgets.Wizard.prepareReplaySetupPane;
			dijit.byId('dashboard_pane').init = pion.widgets.Wizard.prepareDashboardSelectionPane;

			dojo.subscribe('wizard-selectChild', function(page) {
				// Update the labels of the navigation buttons for the selected page.
				dojo.forEach(dojo.query('.prev_button', page.domNode), function(node) {
					_this.previousButton.attr('label', node.innerHTML);
					if (node.getAttribute('returnPane'))
						page.returnPane = node.getAttribute('returnPane');
				});
				var edition_specific_query = '.prev_button_' + pion.edition.toLowerCase();
				dojo.forEach(dojo.query(edition_specific_query, page.domNode), function(node) {
					_this.previousButton.attr('label', node.innerHTML);
					if (node.getAttribute('returnPane'))
						page.returnPane = node.getAttribute('returnPane');
				});
				dojo.forEach(dojo.query('.next_button', page.domNode), function(node) {
					_this.nextButton.attr('label', node.innerHTML);
				});
				edition_specific_query = '.next_button_' + pion.edition.toLowerCase();
				dojo.forEach(dojo.query(edition_specific_query, page.domNode), function(node) {
					_this.nextButton.attr('label', node.innerHTML);
				});
				dojo.forEach(dojo.query('.done_button', page.domNode), function(node) {
					_this.doneButton.attr('label', node.innerHTML);
				});

				if (page.init)
					page.init();
			});
		},
		finish: function() {
			pion.widgets.Wizard.switchToOuter();

			var templates = [];

			var sniffer_config =
										'<Plugin>SnifferReactor</Plugin>'
										+ '<X>50</X>'
										+ '<Y>100</Y>'
										+ '<Name>Capture Traffic</Name>'
										+ '<Comment>Captures raw network traffic to generate HTTP request events</Comment>'
										+ '<Protocol>' + pion.protocols.default_id + '</Protocol>'
										+ '<ProcessingThreads>1</ProcessingThreads>'
										+ '<MaxPacketQueueSize>100000</MaxPacketQueueSize>'
										+ '<QueueEventDelivery>true</QueueEventDelivery>'
										+ '<HideCreditCardNumbers>false</HideCreditCardNumbers>';
			dojo.forEach(pion.wizard.devices, function(device) {
				var tcp_ports = dojo.map(pion.wizard.ports, function(item) {return 'tcp port ' + item});
				sniffer_config += '<Capture><Interface>' + device + '</Interface><Filter>';
				sniffer_config += tcp_ports.join(' or ');
				sniffer_config += '</Filter></Capture>';
			});

			// The remainder will be added in pion.widgets.Wizard.applyTemplatesIfNeeded().
			var clickstream_config = 
				'<X>250</X>' + 
				'<Y>200</Y>';

			var session_group_config = '';
			var ignore_default_group = (pion.wizard.host_suffixes.length > 0);
			if (pion.wizard.host_suffixes.length > 0) {
				var pieces_of_first_host_suffix = pion.wizard.host_suffixes[0].split('.');
				var num_pieces = pieces_of_first_host_suffix.length;
				var session_group_name = pieces_of_first_host_suffix[num_pieces == 1? 0 : num_pieces - 2];
				session_group_config +=
					'<SessionGroup id="' + session_group_name + '">' +
						'<Name>' + session_group_name + '</Name>';
				dojo.forEach(pion.wizard.host_suffixes, function(host) {
					session_group_config += '<Host>' + dojo.trim(host) + '</Host>';
				});
				dojo.forEach(pion.wizard.cookies, function(cookie) {
					session_group_config += '<Cookie type="' + (cookie.is_visitor_cookie? 'v' : 's') + '">' + cookie.name + '</Cookie>';
				});
				session_group_config +=
					'</SessionGroup>';
			}

			templates.push({
				label: 'clickstream',
				url: '/resources/ClickstreamTemplate.tmpl',
				substitutions: {IgnoreDefaultGroup: ignore_default_group, SessionGroupConfig: session_group_config}
			});

			if (pion.wizard.analytics_provider == 'Omniture') {
				var analytics_config =
					'<Plugin>OmnitureAnalyticsReactor</Plugin>' + 
					'<X>50</X>' +
					'<Y>300</Y>' +
					'<Name>Omniture Analytics</Name>' +
					'<NumConnections>32</NumConnections>' +
					'<HttpHost>' + pion.wizard.omniture_host + '</HttpHost>' +
					'<AccountId>' + pion.wizard.omniture_report_suite + '</AccountId>' +
					'<EncryptConnections>false</EncryptConnections>' +
					'<SendTimestamp>true</SendTimestamp>' +
					'<StripClientIP>' + pion.wizard.strip_client_ip + '</StripClientIP>' +
					'<Query name="ipaddress">urn:vocab:clickstream#c-ip</Query>' +
					'<Query name="userAgent">urn:vocab:clickstream#useragent</Query>' +
					'<Query name="pageName">urn:vocab:clickstream#page-title</Query>' +
					'<Query name="referrer">urn:vocab:clickstream#referer</Query>' +
					'<Query name="visitorID">[computed]</Query>' +
					'<Query name="server">[computed]</Query>' +
					'<Query name="pageURL">[computed]</Query>' +
					'<Query name="timestamp">[computed]</Query>' +
					'<Query name="reportSuiteID">[computed]</Query>';
			} else if (pion.wizard.analytics_provider == 'Webtrends') {
				// The remainder will be added in pion.widgets.Wizard.applyTemplatesIfNeeded().
				var analytics_config = 
					'<X>50</X>' + 
					'<Y>300</Y>';

				templates.push({
					label: 'analytics',
					is_json: true,
					plugin: 'WebTrendsAnalyticsReactor',
					substitutions: {
						AccountId: pion.wizard.webtrends_account_id,
						HttpHost: pion.wizard.webtrends_host,
						StripClientIP: pion.wizard.strip_client_ip
					}
				});
			} else if (pion.wizard.analytics_provider == 'Google') {
				var analytics_config =
					'<Plugin>GoogleAnalyticsReactor</Plugin>' + 
					'<X>50</X>' +
					'<Y>300</Y>' +
					'<Name>Google Analytics</Name>' +
					'<AccountId>' + pion.wizard.google_account_id + '</AccountId>' +
					'<NumConnections>32</NumConnections>' +
					'<EncryptConnections>false</EncryptConnections>' +
					'<StripClientIP>' + pion.wizard.strip_client_ip + '</StripClientIP>';
			} else if (pion.wizard.analytics_provider == 'Unica') {
				// The remainder will be added in pion.widgets.Wizard.applyTemplatesIfNeeded().
				var analytics_config = 
					'<X>50</X>' + 
					'<Y>300</Y>';

				templates.push({
					label: 'analytics',
					is_json: true,
					plugin: 'UnicaAnalyticsReactor',
					substitutions: {
						AccountId: pion.wizard.unica_account_id,
						HttpHost: pion.wizard.unica_host,
						StripClientIP: pion.wizard.strip_client_ip
					}
				});
			} else {
				// TODO:
			}

			if (pion.edition == 'Replay') {
				var chr_config = 
					'<Plugin>ContentHashReactor</Plugin>' + 
					'<X>250</X>' + 
					'<Y>100</Y>' + 
					'<Name>Detect Page Content</Name>' + 
					'<SourceTerm>urn:vocab:clickstream#sc-content</SourceTerm>' + 
					'<MatchAllComparisons>true</MatchAllComparisons>' + 
					'<Comment>Looks for page content in HTTP events that will be stored for Replay</Comment>' + 
					'<Comparison>' + 
						'<Term>urn:vocab:clickstream#status</Term>' + 
						'<Type>equals</Type>' + 
						'<Value>200</Value>' + 
						'<MatchAllValues>false</MatchAllValues>' + 
					'</Comparison>' + 
					'<Comparison>' + 
						'<Term>urn:vocab:clickstream#content-type</Term>' + 
						'<Type>regex</Type>' + 
						'<Value>^(text/html|application/xhtml|text/vnd.wap.wml)</Value>' + 
						'<MatchAllValues>false</MatchAllValues>' + 
					'</Comparison>';

				// The remainder will be added in pion.widgets.Wizard.applyTemplatesIfNeeded().
				var mdr_config = 
					'<X>250</X>' + 
					'<Y>300</Y>';

				templates.push({
					label: 'mdr',
					url: '/resources/MDRTemplate.tmpl',
					substitutions: {MaxDiskUsage: pion.wizard.max_disk_usage}
				});

				var reactors = [
					{label: 'sniffer', config: sniffer_config},
					{label: 'chr', config: chr_config},
					{label: 'clickstream', config: clickstream_config},
					{label: 'mdr', config: mdr_config}
				];
				var connections = [
					{from: 'sniffer', to: 'chr'},
					{from: 'chr', to: 'clickstream'},
					{from: 'clickstream', to: 'mdr'}
				];

			} else {
				var reactors = [
					{label: 'sniffer', config: sniffer_config},
					{label: 'clickstream', config: clickstream_config}
				];
				var connections = [
					{from: 'sniffer', to: 'clickstream'}
				];
			}

			if (analytics_config) {
				reactors.push({label: 'analytics', config: analytics_config});
				connections.push({from: 'clickstream', to: 'analytics'});
			}

			var workspaces = [{label: 'clickstream', name: 'Clickstream'}];
			wizard_config = {
				templates: templates,
				reactors: reactors,
				connections: connections,
				workspaces: workspaces
			};

			wizard_config.dashboards = [];
			if (pion.wizard.dashboards.length > 0) {
				workspaces.push({label: 'reports', name: 'Dashboard Reports'});

				templates.push({
					label: 'ReportsAnchorFilterReactor',
					url: '/resources/ReportsAnchorFilterReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'ReportsAnchorFilterReactor', workspace: 'reports', config: ''});
				connections.push({from: 'clickstream', to: 'ReportsAnchorFilterReactor'});

				templates.push({
					label: 'HTTPEventsFilterReactor',
					url: '/resources/HTTPEventsFilterReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'HTTPEventsFilterReactor', workspace: 'reports', config: ''});
				connections.push({from: 'ReportsAnchorFilterReactor', to: 'HTTPEventsFilterReactor'});
			}
			if (dojo.indexOf(pion.wizard.dashboards, 'Activity') != -1) {
				wizard_config.dashboards.push({url: '/resources/ActivityDashboard.json'});

				templates.push({
					label: 'RealUserRequestsAggregateReactor',
					url: '/resources/RealUserRequestsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'RealUserRequestsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'RealUserRequestsAggregateReactor'});

				templates.push({
					label: 'AutomatedRequestsAggregateReactor',
					url: '/resources/AutomatedRequestsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'AutomatedRequestsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'AutomatedRequestsAggregateReactor'});
			}
			if (dojo.indexOf(pion.wizard.dashboards, 'Availability') != -1) {
				wizard_config.dashboards.push({url: '/resources/AvailabilityDashboard.json'});

				templates.push({
					label: 'SuccessfulRequestsAggregateReactor',
					url: '/resources/SuccessfulRequestsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'SuccessfulRequestsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'SuccessfulRequestsAggregateReactor'});

				templates.push({
					label: 'RefusedRequestsAggregateReactor',
					url: '/resources/RefusedRequestsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'RefusedRequestsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'RefusedRequestsAggregateReactor'});

				templates.push({
					label: 'ClientErrorsAggregateReactor',
					url: '/resources/ClientErrorsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'ClientErrorsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'ClientErrorsAggregateReactor'});

				templates.push({
					label: 'ServerErrorsAggregateReactor',
					url: '/resources/ServerErrorsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'ServerErrorsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'ServerErrorsAggregateReactor'});
			}
			if (dojo.indexOf(pion.wizard.dashboards, 'Performance') != -1) {
				wizard_config.dashboards.push({url: '/resources/PerformanceDashboard.json'});

				templates.push({
					label: 'PageViewEventsFilterReactor',
					url: '/resources/PageViewEventsFilterReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'PageViewEventsFilterReactor', workspace: 'reports', config: ''});
				connections.push({from: 'ReportsAnchorFilterReactor', to: 'PageViewEventsFilterReactor'});

				templates.push({
					label: 'TotalPageViewsAggregateReactor',
					url: '/resources/TotalPageViewsAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'TotalPageViewsAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'PageViewEventsFilterReactor', to: 'TotalPageViewsAggregateReactor'});

				templates.push({
					label: 'PageLoadTimeAggregateReactor',
					url: '/resources/PageLoadTimeAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'PageLoadTimeAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'PageViewEventsFilterReactor', to: 'PageLoadTimeAggregateReactor'});

				templates.push({
					label: 'ServerReplyTimeAggregateReactor',
					url: '/resources/ServerReplyTimeAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'ServerReplyTimeAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'ServerReplyTimeAggregateReactor'});

				templates.push({
					label: 'DataCenterTimeAggregateReactor',
					url: '/resources/DataCenterTimeAggregateReactor.tmpl',
					substitutions: {}
				});
				reactors.push({label: 'DataCenterTimeAggregateReactor', workspace: 'reports', config: ''});
				connections.push({from: 'HTTPEventsFilterReactor', to: 'DataCenterTimeAggregateReactor'});
			}

			this.applyTemplatesIfNeeded(wizard_config)
			.addCallback(pion.widgets.Wizard.addWorkspacesFromWizard)
			.addCallback(pion.widgets.Wizard.addReactorsFromWizard)
			.addCallback(pion.widgets.Wizard.addConnectionsFromWizard)
			.addCallback(pion.widgets.Wizard.addReplayIfNeeded)
			.addCallback(pion.widgets.Wizard.startSniffer)
			.addCallback(pion.setup_success_callback);
		},
		applyTemplatesIfNeeded: function(wizard_config) {
			var dfd = new dojo.Deferred();

			if (wizard_config.templates.length == 0) {
				dfd.callback(wizard_config);
				return dfd;
			}

			var labels = dojo.map(wizard_config.reactors, function(item) {return item.label});
			var num_templates_applied = 0;
			dojo.forEach(wizard_config.templates, function(template) {
				var index = dojo.indexOf(labels, template.label);

				if (template.is_json) {
					dojo.xhrGet({
						url: '/resources/' + template.plugin + '.json',
						handleAs: 'json',
						timeout: 20000,
						load: function(response) {
							var xml_config = '<Plugin>' + template.plugin + '</Plugin>';
							dojo.forEach(response.required_input, function(name) {
								xml_config += '<' + name + '>' + template.substitutions[name] + '</' + name + '>';
							});
							for (var name in response.option_defaults) {
								if (dojo.indexOf(response.required_input, name) == -1) {
									xml_config += '<' + name + '>' + response.option_defaults[name] + '</' + name + '>';
								}
							}
							for (var name in response.value_defaults) {
								if (dojo.indexOf(response.required_input, name) == -1) {
									xml_config += '<' + name + '>' + response.value_defaults[name] + '</' + name + '>';
								}
							}
							for (var tag in response.multivalued_defaults) {
								var identifier = response.multivalued_defaults[tag].identifier;
								var data = response.multivalued_defaults[tag].data;
								for (var key in data) {
									xml_config += '<' + tag + ' ' + identifier + '="' + key + '">' + data[key] + '</' + tag + '>';
								}
							}

							wizard_config.reactors[index].config += xml_config;
							if (++num_templates_applied == wizard_config.templates.length) {
								dfd.callback(wizard_config);
							}
							return response;
						},
						error: pion.handleXhrGetError
					});
				} else {
					dojo.xhrGet({
						url: template.url,
						handleAs: 'text',
						timeout: 20000,
						load: function(response) {
							var transformed_template = dojo.string.substitute(
								response,
								template.substitutions
							);

							// This strips out EOL characters that can wreak havoc later when attempting to update a config.
							// These can come both from the template file and from dojo.string.substitute().
							var trimmed_XML = transformed_template.replace(/>\s*/g, '>');

							wizard_config.reactors[index].config += trimmed_XML;
							if (++num_templates_applied == wizard_config.templates.length) {
								dfd.callback(wizard_config);
							}
							return response;
						},
						error: pion.handleXhrGetError
					});
				}
			});

			return dfd;
		},
		back: function() {
			// Overrides dijit.layout.StackContainer.back()
			if (this.selectedChildWidget.returnPane) {
				this.selectChild(dijit.byId(this.selectedChildWidget.returnPane));
			} else {
				this.selectChild(this._adjacent(false));
			}
		},
		placeholder: function() {
		}
	}
);

pion.widgets.Wizard.exitEarly = function() {
	pion.widgets.Wizard.switchToOuter();
	pion.setup_success_callback();
}

pion.widgets.Wizard.switchToOuter = function() {
	dojo.addClass('wizard', 'hidden');
	dojo.removeClass('outer', 'hidden');
	dijit.byId('main_stack_container').resize();
	dojo.byId('current_user_menu_section').style.visibility = 'visible';
	dojo.byId('current_user').innerHTML = dojo.cookie('user');
}

pion.widgets.Wizard.forbid = function() {
	// Don't allow the user to proceed via the regular Wizard button.
	return false;
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
			if (pion.edition == 'Lite') {
				pion.widgets.Wizard.prepareSetupReview();
				pion.wizard.selectChild(dijit.byId('review_setup'));
			} else if (pion.edition == 'Enterprise') {
				pion.widgets.Wizard.prepareDashboardSelectionPane();
				pion.wizard.selectChild(dijit.byId('dashboard_pane'));
			}
		},
		onError: pion.handleFetchError
	});
	if (pion.edition == 'Replay') {
		return true; // Proceed to next pane.
	} else {
		return false; // Don't proceed now, but in onComplete(), will go a different pane. 
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
	if (form_values.max_disk_usage < 10)
		return 'Maximum disk usage must be at least 10 GB.';
	pion.wizard.max_disk_usage = form_values.max_disk_usage;
	pion.widgets.Wizard.prepareDashboardSelectionPane();
	return true;
}

pion.widgets.Wizard.prepareDashboardSelectionPane = function() {
	if (! pion.widgets.Wizard.dashboard_pane_initialized) {
		if (dojo.cookie('sample_dashboards') !== undefined) {
			dijit.byId('dashboard_selection_form').attr('value', {dashboard_check_boxes: dojo.cookie('sample_dashboards').split(',')});
		}
		pion.widgets.Wizard.dashboard_pane_initialized = true;
	}
}

pion.widgets.Wizard.checkDashboardSelection = function() {
	pion.wizard.dashboards = dijit.byId('dashboard_selection_form').attr('value').dashboard_check_boxes;
	dojo.cookie('sample_dashboards', pion.wizard.dashboards.join(','), {expires: 5000}); // 5000 days
	pion.widgets.Wizard.prepareSetupReview();
	return true;
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
	dojo.byId('setup_review_form_dashboards').innerHTML = pion.wizard.dashboards.join(', ');
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
					pion.widgets.Wizard.finishCleanupAndReload();
				}
				return response;
			},
			error: pion.getXhrErrorHandler(dojo.xhrDelete)
		});
	});
}

pion.widgets.Wizard.deleteAllDashboards = function() {
	var dfd = new dojo.Deferred();

	var dashboard_service_tab = dijit.byId('dashboard_service_tab');
	if (dashboard_service_tab)
		dashboard_service_tab.deleteAllDashboards().addCallback(function() { dfd.callback(); });
	else
		dfd.callback();

	return dfd;
}

pion.widgets.Wizard.finishCleanupAndReload = function() {
	// Since there are no Reactors configured, any Dashboards or Workspaces are useless, so delete them.
	pion.widgets.Wizard.deleteAllDashboards()
	.addCallback(function() { pion.reactors.deleteAllWorkspaces(); })
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
				pion.widgets.Wizard.finishCleanupAndReload();
			} else {
				var mixinNumDashboardPanes = function(kw_args) {
					var dfd = new dojo.Deferred();
					var dashboard_service_tab = dijit.byId('dashboard_service_tab');
					if (dashboard_service_tab) {
						dashboard_service_tab.getNumDashboardPanes().addCallback(function(num_panes) {
							kw_args.num_dashboard_panes = num_panes;
							dfd.callback(kw_args);
						});
					} else {
						kw_args.num_dashboard_panes = 0;
						dfd.callback(kw_args);
					}
					return dfd;
				}

				pion.services.getConfiguredServices()
				.addCallback(mixinNumDashboardPanes)
				.addCallback(function(kw_args) {
					var replay_configured = dojo.some(kw_args.configured_services, function(service) {
						return service.plugin == 'ReplayService';
					});
					var num_panes = kw_args.num_dashboard_panes;
					var message = 'Warning: You currently have '
								+ (reactors.length == 1? 'one Reactor' : reactors.length + ' Reactors')
								+ ((replay_configured && num_panes == 0)? ' and a Replay Service' : '')
								+ ((replay_configured && num_panes == 1)? ', a Replay Service and one Dashboard chart' : '')
								+ ((replay_configured && num_panes > 1)? ', a Replay Service and ' + num_panes + ' Dashboard charts' : '')
								+ ((! replay_configured && num_panes == 1)? ' and one Dashboard chart' : '')
								+ ((! replay_configured && num_panes > 1)? ' and ' + num_panes + ' Dashboard charts' : '')
								+ ' configured.  If you continue, '
								+ (reactors.length == 1 && ! replay_configured && num_panes == 0? 'it ' : 'they ')
								+ 'will be deleted, and the Wizard will guide you through '
								+ 'creating a new configuration from scratch.  If you want to edit the configuration of a '
								+ 'particular Reactor, you can do so by double clicking on it in the Reactors '
								+ 'tab, or by editing reactors.xml.  '
								+ (replay_configured? 'The Replay Service can be edited by editing services.xml.  ' : '')
								+ (num_panes > 0? 'Dashboards can be edited by editing dashboards.xml.  ' : '')
								+ 'Do you want to delete your current Reactors'
								+ ((replay_configured && num_panes == 0)? ' and Replay Service' : '')
								+ ((replay_configured && num_panes > 0)? ', Replay Service and Dashboard charts' : '')
								+ ((! replay_configured && num_panes > 0)? ' and Dashboard charts' : '')
								+ ' and continue to the Wizard?';
					pion.doDeleteConfirmationDialog(message, pion.widgets.Wizard.deleteAllReactorsAndReload, reactors);
				});
			}
		},
		error: pion.handleXhrGetError
	});
}

pion.widgets.Wizard.addWorkspacesFromWizard = function(wizard_config) {
	var dfd = new dojo.Deferred();

	var num_workspaces_added = 0;
	wizard_config.workspace_ids = {};
	var post_data_header = '<PionConfig><Workspace><Name>';
	dojo.forEach(wizard_config.workspaces, function(workspace) {
		var post_data = post_data_header + workspace.name + '</Name></Workspace></PionConfig>';
		dojo.rawXhrPost({
			url: '/config/workspaces',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				var node = response.getElementsByTagName('Workspace')[0];
				wizard_config.workspace_ids[workspace.label] = node.getAttribute('id');
				if (++num_workspaces_added == wizard_config.workspaces.length) {
					dfd.callback(wizard_config);
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});

	return dfd;
}

pion.widgets.Wizard.addReactorsFromWizard = function(wizard_config) {
	var dfd = new dojo.Deferred();

	if (wizard_config.reactors.length == 0) {
		dfd.callback(wizard_config);
		return dfd;
	}

	var num_reactors_added = 0;
	wizard_config.reactor_ids = {};
	var post_data_header = '<PionConfig><Reactor><Source>Wizard</Source><Workspace>';
	dojo.forEach(wizard_config.reactors, function(reactor) {
		var workspace_id = wizard_config.workspace_ids[reactor.workspace? reactor.workspace : 'clickstream'];
		var post_data = post_data_header + workspace_id + '</Workspace>'
			+ reactor.config + '</Reactor></PionConfig>';  
		dojo.rawXhrPost({
			url: '/config/reactors',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				var node = response.getElementsByTagName('Reactor')[0];
				wizard_config.reactor_ids[reactor.label] = node.getAttribute('id');
				if (++num_reactors_added == wizard_config.reactors.length) {
					dfd.callback(wizard_config);
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});

	return dfd;
}

pion.widgets.Wizard.addConnectionsFromWizard = function(wizard_config) {
	var dfd = new dojo.Deferred();

	if (wizard_config.connections.length == 0)
		dfd.callback(wizard_config);

	var num_connections_added = 0;
	dojo.forEach(wizard_config.connections, function(connection) {
		var post_data = '<PionConfig><Connection><Type>reactor</Type>'
			+ '<From>' + wizard_config.reactor_ids[connection.from] + '</From>'
			+ '<To>' + wizard_config.reactor_ids[connection.to] + '</To>'
			+ '</Connection></PionConfig>';  
		dojo.rawXhrPost({
			url: '/config/connections',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response) {
				if (++num_connections_added == wizard_config.connections.length) {
					dfd.callback(wizard_config);
				}
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	});

	return dfd;
}

pion.widgets.Wizard.addReplayIfNeeded = function(wizard_config) {
	var dfd = new dojo.Deferred();

	if (pion.edition != 'Replay') {
		dfd.callback(wizard_config);
		return dfd;
	}

	var replay_config = 
		'<Name>Replay Query Service</Name>' +
		'<Comment>Pion Replay query service</Comment>' +
		'<Plugin>ReplayService</Plugin>' +
		'<Resource>/replay</Resource>' +
		'<Server>main-server</Server>' +
		'<Namespace id="0">' +
			'<Comment>Default Instance</Comment>' +
			'<MultiDatabaseOutputReactor>' + wizard_config.reactor_ids['mdr'] + '</MultiDatabaseOutputReactor>' +
		'</Namespace>';

	var post_data = '<PionConfig><PlatformService>' + replay_config + '</PlatformService></PionConfig>';  
	dojo.rawXhrPost({
		url: '/config/services',
		contentType: "text/xml",
		handleAs: "xml",
		postData: post_data,
		load: function(response) {
			var node = response.getElementsByTagName('PlatformService')[0];
			dfd.callback(wizard_config);
			return response;
		},
		error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
	});

	return dfd;
}

pion.widgets.Wizard.startSniffer = function(wizard_config) {
	var dfd = new dojo.Deferred();
	dojo.xhrPut({
		url: '/config/reactors/' + wizard_config.reactor_ids['sniffer'] + '/start',
		load: function(response) {
			dfd.callback(wizard_config);
			return response;
		},
		error: pion.getXhrErrorHandler(dojo.xhrPut)
	});
	return dfd;
}

