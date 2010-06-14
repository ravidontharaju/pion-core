dojo.provide("pion.services");
dojo.require("pion.plugins");
dojo.require("plugins.services.Service");
dojo.require("dojox.data.XmlStore");

pion.services.config_store = new dojox.data.XmlStore({url: '/config/services'});

pion.services.labels_by_tab_id = {};

pion.services.init = function() {
	init_services_standby.show();
	pion.services.getAllServicesInUIDirectory = function() {
		var d = new dojo.Deferred();
		var store = new dojox.data.XmlStore({url: '/config/services/plugins'});
		store.fetch({
			onComplete: function(items) {
				var services_in_ui_dir = dojo.map(items, function(item) {
					return store.getValue(item, 'Plugin').toString();
				});
				d.callback(services_in_ui_dir);
			}
		});
		return d;
	}

	// configured_services will be a list of Plugins which have an instance configured in services.xml.
	pion.services.getConfiguredServices = function(services_in_ui_dir) {
		var d = new dojo.Deferred();

		dojo.xhrGet({
			url: '/config/services',
			handleAs: 'xml',
			timeout: 5000,
			load: function(response, ioArgs) {
				var plugin_elements = response.getElementsByTagName('Plugin');
				var configured_services = dojo.map(plugin_elements, function(n) {
					return dojo.isIE? n.childNodes[0].nodeValue : n.textContent;
				});
				d.callback({services_in_ui_dir: services_in_ui_dir, configured_services: configured_services});
				return response;
			},
			error: pion.handleXhrGetError
		});

		return d;
	}

	// Expected properties of kw_args:
	// services_in_ui_dir: all Services for which a UI was found in the UI directory 
	//                     (as specified in services.xml, in PlatformService "config-service").
	// configured_services: all Services in services.xml
	var initUsableServicePlugins = function(kw_args) {
		var d = new dojo.Deferred();
		var conditional_prototypes = [];
		dojo.forEach(kw_args.services_in_ui_dir, function(service) {
			// Skip plugins that aren't configured.
			if (dojo.indexOf(kw_args.configured_services, service) != -1) {
				// Skip plugins that can't be found on any of the configured plugin paths.
				if (dojo.indexOf(pion.plugins.available_plugins, service) != -1) {
					var prototype = pion.plugins.getPluginPrototype('plugins.services', service, '/plugins/services');
					if ('isUsable' in prototype) {
						conditional_prototypes.push(prototype);
					} else {
						new prototype({title: prototype.label, id: prototype.tab_id});
						console.debug('UI for service "', prototype.label, '" has been added.');
					}
				}
			}
		});
		var num_pending_prototypes = conditional_prototypes.length;
		if (num_pending_prototypes == 0) {
			d.callback();
		} else {
			dojo.forEach(conditional_prototypes, function(prototype) {
				prototype.isUsable()
				.addCallback(function(is_usable) {
					if (is_usable) {
						new prototype({title: prototype.label, id: prototype.tab_id});
						console.debug('UI for service "', prototype.label, '" has been added.');
					} else {
						console.debug('UI for service "', prototype.label, '" has NOT been added: isUsable() returned false.');
					}
					num_pending_prototypes--;
					if (num_pending_prototypes == 0)
						d.callback();
				})
				.addErrback(function(e) {
					console.debug('UI for service "', prototype.label, '" has NOT been added: ', e);
					num_pending_prototypes--;
					if (num_pending_prototypes == 0)
						d.callback();
				});
			});
		}
		return d;
	}

	pion.plugins.initAvailablePluginList()
		.addCallback(pion.services.getAllServicesInUIDirectory)
		.addCallback(pion.services.getConfiguredServices)
		.addCallback(initUsableServicePlugins)
		.addCallback(pion.initTabs);
}