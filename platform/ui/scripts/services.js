dojo.provide("pion.services");
dojo.require("pion.plugins");
dojo.require("plugins.services.Service");
dojo.require("dojox.data.XmlStore");

pion.services.config_store = new dojox.data.XmlStore({url: '/config/services'});

pion.services.init = function() {
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

	// services_in_ui_dir: all Services for which a UI was found in the UI directory 
	//                     (as specified in services.xml, in PlatformService "config-service").
	var initUsableServicePlugins = function(services_in_ui_dir) {
		var d = new dojo.Deferred();
		plugin_data_store_items = [];
		dojo.forEach(services_in_ui_dir, function(service) {
			// Skip plugins that can't be found on any of the configured plugin paths.
			if (dojo.indexOf(pion.plugins.loaded_plugins, service) != -1) {
				var prototype = pion.plugins.getPluginPrototype('plugins.services', service, '/plugins/services');
				new prototype({title: prototype.label});
				console.debug('UI for service "', prototype.label, '" has been added.');
			}
		});
		d.callback();
		return d;
	}

	pion.plugins.initLoadedPluginList()
		.addCallback(pion.services.getAllServicesInUIDirectory)
		.addCallback(initUsableServicePlugins);
}