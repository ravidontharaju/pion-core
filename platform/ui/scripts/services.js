dojo.provide("pion.services");
dojo.require("dojox.data.XmlStore");

pion.services.config_store = new dojox.data.XmlStore({url: '/config/services'});

pion.services.init = function() {
	// Request list of all Services available in the UI directory.
	var config_services_plugins_store = new dojox.data.XmlStore({url: '/config/services/plugins'});

	dojo.xhrGet({
		url: '/config/plugins',
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			// Get list of all plugins found on any of the configured plugin paths.
			pion.available_plugins = [];
			var plugin_elements = response.getElementsByTagName('Plugin');
			dojo.forEach(plugin_elements, function(n) {
				pion.available_plugins.push(dojo.isIE? n.childNodes[0].nodeValue : n.textContent);
			});

			config_services_plugins_store.fetch({
				onItem: function(item) {
					var plugin = config_services_plugins_store.getValue(item, 'Plugin').toString();

					// Skip plugins that can't be found on any of the configured plugin paths.
					if (dojo.indexOf(pion.available_plugins, plugin) != -1) {
						// Check if the module for this Service is already loaded, and if not, load it.
						var service_class = "plugins.services." + plugin;
						var prototype = dojo.getObject(service_class);
						if (!prototype) {
							var path = '/plugins/services/' + plugin + '/' + plugin;
							dojo.registerModulePath(service_class, path);
							dojo.requireIf(true, service_class);
							prototype = dojo.getObject(service_class);
						}
						new prototype({title: prototype['label']});
						console.debug('UI for service "', prototype['label'], '" has been added.');
					}
				}
			});
			return response;
		},
		error: pion.handleXhrGetError
	});
}
