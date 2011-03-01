dojo.provide("pion.plugins");
dojo.require("pion._base");

pion.plugins.initAvailablePluginList = function() {
	var d = new dojo.Deferred();
	if (pion.plugins.available_plugins) {
		d.callback();
	} else {
		dojo.xhrGet({
			url: '/config/plugins',
			handleAs: 'xml',
			timeout: 5000,
			load: function(response, ioArgs) {
				// Get list of all plugins found on any of the configured plugin paths.
				pion.plugins.available_plugins = [];
				var plugin_elements = response.getElementsByTagName('Plugin');
				dojo.forEach(plugin_elements, function(n) {
					pion.plugins.available_plugins.push(dojo.isIE? n.childNodes[0].nodeValue : n.textContent);
				});
				d.callback();
				return response;
			},
			error: pion.handleXhrGetError
		});
	}
	return d;
}

pion.plugins.getPluginPrototype = function(namespace, plugin_name, directory_to_search) {
	var plugin_class = namespace + '.' + plugin_name;

	// Check if the module for this Plugin is already loaded, and if not, load it.
	var prototype = dojo.getObject(plugin_class);
	if (! prototype) {
		var path = directory_to_search + '/' + plugin_name + '/' + plugin_name;
		dojo.registerModulePath(plugin_class, path);
		dojo.requireIf(true, plugin_class);
		prototype = dojo.getObject(plugin_class);
	}

	return prototype;
}

pion.plugins.getPermissions = function() {
	var dfd = new dojo.Deferred();
	dojo.xhrGet({
		url: '/query/permissions',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			var permission_nodes = response.getElementsByTagName('Permission');
			pion.permissions_object = {};
			dojo.forEach(permission_nodes, function(node) {
				var type = node.getAttribute('type');
				pion.permissions_object[type] = node;
			});
			dfd.callback();
			return response;
		},
		error: pion.handleXhrGetError
	});
	return dfd;
}
