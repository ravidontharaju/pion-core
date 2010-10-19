dojo.provide("pion.services");
dojo.require("pion.plugins");
dojo.require("plugins.services.Service");
dojo.require("dojox.data.XmlStore");

pion.services.config_store = new dojox.data.XmlStore({url: '/config/services', rootItem: 'PlatformService'});

pion.services.createService = function(prototype) {
	var kw_args = {title: prototype.label, resource: prototype.resource};

	// If the Service about to be created is a widget, then we would like to specify kw_args.id, which will then be used as the widget ID.
	// So far, the only Services we have that are widgets are ones like ReplayService that are added as tabs of the main stack container.
	// (MonitorService, although it creates widgets, is not itself a widget.)
	// So, for now, it's enough to just check for the existence of a class member called tab_id, and use it if found.
	if ('tab_id' in prototype)
		kw_args.id = prototype.tab_id;

	new prototype(kw_args);

	console.debug('UI for service "', prototype.label, '" has been added.');
}

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

	// configured_services will be a list of PlatformService instances configured in services.xml.
	pion.services.getConfiguredServices = function(services_in_ui_dir) {
		var d = new dojo.Deferred();

		pion.services.config_store.fetch({
			onComplete: function(items) {
				var configured_services = dojo.map(items, function(item) {
					return {
						resource: pion.services.config_store.getValue(item, 'Resource').toString(),
						plugin: pion.services.config_store.getValue(item, 'Plugin').toString()
					};
				});
				d.callback({services_in_ui_dir: services_in_ui_dir, configured_services: configured_services});
			},
			onError: pion.handleFetchError
		});

		return d;
	}

	// All loaded services which require permission.
	pion.services.restrictable_services = [];

	// Expected properties of kw_args:
	// services_in_ui_dir: all Services for which a UI was found in the UI directory 
	//                     (as specified in services.xml, in PlatformService "config-service").
	// configured_services: all PlatformServices in services.xml
	var initUsableServicePlugins = function(kw_args) {
		var d = new dojo.Deferred();

		var loadable_services = dojo.filter(kw_args.configured_services, function(service) {
			var is_in_ui_dir = dojo.indexOf(kw_args.services_in_ui_dir, service.plugin) != -1;
			var is_available = dojo.indexOf(pion.plugins.available_plugins, service.plugin) != -1;
			return is_in_ui_dir && is_available;
		});
		var conditional_prototypes = [];
		dojo.forEach(loadable_services, function(service) {
			var prototype = pion.plugins.getPluginPrototype('plugins.services', service.plugin, '/plugins/services');
			if ('requiresPermission' in prototype && prototype.requiresPermission(service)) {
				// Does the user have any permission at all for this Service?  If not, skip it.
				if (! (service.plugin in pion.permissions_object || 'Admin' in pion.permissions_object))
					return;

				// TODO: Confirm that permission_layout in service?
				pion.services.restrictable_services.push(service);
			}
			prototype.resource = service.resource;
			if ('isUsable' in prototype) {
				conditional_prototypes.push(prototype);
			} else {
				pion.services.createService(prototype);
			}
		});
		var num_pending_prototypes = conditional_prototypes.length;
		if (num_pending_prototypes == 0) {
			d.callback();
		} else {
			dojo.forEach(conditional_prototypes, function(prototype) {
				prototype.isUsable(prototype.resource)
				.addCallback(function(is_usable) {
					if (is_usable) {
						pion.services.createService(prototype);
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
		.addCallback(pion.getPermissions)
		.addCallback(pion.services.getAllServicesInUIDirectory)
		.addCallback(pion.services.getConfiguredServices)
		.addCallback(initUsableServicePlugins)
		.addCallback(pion.initTabs);
}