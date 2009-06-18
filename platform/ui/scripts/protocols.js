dojo.provide("pion.protocols");
dojo.require("pion.plugins");
dojo.require("plugins.protocols.Protocol");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.data.XmlStore");

// Protocols don't have to be listed here to be usable, but they do to be included in pion-dojo.js.
dojo.require("plugins.protocols.HTTPProtocol");

var selected_protocol_pane = null;

pion.protocols.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.protocols.height;
}

pion.protocols.config_store = new dojox.data.XmlStore({url: '/config/protocols'});

// fetchItemByIdentity and getIdentity are needed for dijit.form.FilteringSelect and pion.widgets.SimpleSelect.
pion.protocols.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.protocols.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem, onError: pion.handleFetchError});
}
pion.protocols.config_store.getIdentity = function(item) {
	return pion.protocols.config_store.getValue(item, '@id');
}

// This is 'HTTP (full content)'
pion.protocols.default_id = "593f044a-ac60-11dd-aba3-001cc02bd66b";

pion.protocols.init = function() {
	pion.protocols.getAllProtocolsInUIDirectory = function() {
		var d = new dojo.Deferred();
		var store = new dojox.data.XmlStore({url: '/config/protocols/plugins'});
		store.fetch({
			onComplete: function(items) {
				var protocols_in_ui_dir = dojo.map(items, function(item) {
					return store.getValue(item, 'Plugin').toString();
				});
				d.callback(protocols_in_ui_dir);
			}
		});
		return d;
	}

	// protocols_in_ui_dir: all Protocols for which a UI was found in the UI directory 
	//                      (as specified in services.xml, in PlatformService "config-service").
	var initUsableProtocolPlugins = function(protocols_in_ui_dir) {
		var d = new dojo.Deferred();
		plugin_data_store_items = [];
		dojo.forEach(protocols_in_ui_dir, function(protocol) {
			// Skip plugins that can't be found on any of the configured plugin paths.
			if (dojo.indexOf(pion.plugins.loaded_plugins, protocol) != -1) {
				var prototype = pion.plugins.getPluginPrototype('plugins.protocols', protocol, '/plugins/protocols');
				plugin_data_store_items.push({plugin: protocol, label: prototype.label});
			}
			pion.protocols.plugin_data_store = new dojo.data.ItemFileWriteStore({
				data: {
					identifier: 'plugin',
					items: plugin_data_store_items
				}
			});
		});
		d.callback();
		return d;
	}

	var initConfiguredProtocols = function() {
		pion.protocols.config_store.fetch({
			onComplete: function (items, request) {
				var config_accordion = dijit.byId('protocol_config_accordion');
				for (var i = 0; i < items.length; ++i) {
					pion.protocols.createNewPaneFromItem(items[i]);
				}
				var first_pane = config_accordion.getChildren()[0];
				config_accordion.selectChild(first_pane);
			},
			onError: pion.handleFetchError
		});
	}

	pion.plugins.initLoadedPluginList()
		.addCallback(pion.protocols.getAllProtocolsInUIDirectory)
		.addCallback(initUsableProtocolPlugins)
		.addCallback(initConfiguredProtocols);

	dojo.subscribe("protocol_config_accordion-selectChild", protocolPaneSelected);

	pion.protocols.createNewPaneFromItem = function(item) {
		var title = pion.escapeXml(pion.codecs.config_store.getValue(item, 'Name'));
		var plugin = pion.protocols.config_store.getValue(item, 'Plugin');
		var protocol_pane_node = document.createElement('span');
		var pane_class_name = 'plugins.protocols.' + plugin + 'Pane';
		var pane_class = dojo.getObject(pane_class_name);
		if (pane_class) {
			console.debug('found class ', pane_class_name);
			var protocol_pane = new pane_class({ 'class': 'protocol_pane', title: title }, protocol_pane_node);
		} else {
			console.debug('class ', pane_class_name, ' not found; using plugins.protocols.ProtocolPane instead.');
			var protocol_pane = new plugins.protocols.ProtocolPane({ 'class': 'protocol_pane', title: title }, protocol_pane_node);
		}
		protocol_pane.config_item = item;
		protocol_pane.uuid = pion.protocols.config_store.getValue(item, '@id');
		dijit.byId('protocol_config_accordion').addChild(protocol_pane);
		return protocol_pane;
	}
	
	pion.protocols.createNewPaneFromStore = function(id, protocol_config_page_is_selected) {
		pion.protocols.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var protocol_pane = pion.protocols.createNewPaneFromItem(item);
				if (protocol_config_page_is_selected) {
					pion.protocols._adjustAccordionSize();
					dijit.byId('protocol_config_accordion').selectChild(protocol_pane);
				}
			},
			onError: pion.handleFetchError
		});
	}

	function addNewProtocol() {
		var dialog = new plugins.protocols.ProtocolInitDialog({title: 'Add New Protocol'});

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dialog.show();
		dialog.execute = function(dialogFields) {
			console.debug(dialogFields);
			if (plugins.protocols[dialogFields.Plugin] &&
				plugins.protocols[dialogFields.Plugin].edition == 'Enterprise') {
				pion.about.checkKeyStatus({success_callback: function() {_sendPostRequest(dialogFields)}});
			} else {
				_sendPostRequest(dialogFields);
			}
		}
	}

	function _sendPostRequest(dialogFields) {
		var post_data = '<PionConfig><Protocol>';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
		}
		if (plugins.protocols[dialogFields.Plugin] && plugins.protocols[dialogFields.Plugin].custom_post_data) {
			post_data += plugins.protocols[dialogFields.Plugin].custom_post_data;
		}
		post_data += '</Protocol></PionConfig>';
		console.debug('post_data: ', post_data);

		dojo.rawXhrPost({
			url: '/config/protocols',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response){
				var node = response.getElementsByTagName('Protocol')[0];
				var id = node.getAttribute('id');
				console.debug('id (from server): ', id);
				pion.protocols.createNewPaneFromStore(id, true);
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	}

	dojo.connect(dojo.byId('add_new_protocol_button'), 'click', addNewProtocol);
}

pion.protocols._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('protocol_config_accordion');
	var num_protocols = config_accordion.getChildren().length;
	console.debug("num_protocols = " + num_protocols);

	var protocol_pane_body_height = selected_protocol_pane.getHeight();
	var title_height = 0;
	if (num_protocols > 0) {
		var first_pane = config_accordion.getChildren()[0];
		title_height = first_pane.getTitleHeight();
	}
	var accordion_height = protocol_pane_body_height + num_protocols * title_height;
	config_accordion.resize({h: accordion_height});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.protocols.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.protocols.height});
}

function protocolPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	if (pane == selected_protocol_pane) {
		return;
	}
	if (selected_protocol_pane && dojo.hasClass(selected_protocol_pane.domNode, 'unsaved_changes')) {
		var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
		dialog.attr('content', 'Please save or cancel unsaved changes before selecting another Protocol.');
		dialog.show();
		
		// Return to the previously selected pane.
		setTimeout("dijit.byId('protocol_config_accordion').selectChild(selected_protocol_pane)", 500);
		return;
	}

	selected_protocol_pane = pane;
	console.debug('Fetching item ', pane.uuid);
	var store = pion.protocols.config_store;
	store.fetch({
		query: {'@id': pane.uuid},
		onItem: function(item) {
			console.debug('item: ', item);
			pane.populateFromConfigItem(item);
		},
		onError: pion.handleFetchError
	});

	// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	var slide_duration = dijit.byId('protocol_config_accordion').duration;
	setTimeout(function() {
					dojo.style(pane.containerNode, "overflow", "hidden");
					pion.protocols._adjustAccordionSize();
			   },
			   slide_duration + 50);
}
