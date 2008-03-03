dojo.provide("pion.system");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dojox.xml.DomParser");
dojo.require("dijit.Tree");

var server_store;

dojo.declare("childlessChildrenFirstStore", dojo.data.ItemFileWriteStore, {
	// Override getValues, which is used by dijit.Tree.getItemChildren, so that we can re-order the children.
	getValues: function (item, attribute) {
		var values = this.inherited("getValues", arguments);

		// getItemChildren only calls getValues with attribute = childrenAttr
		if (attribute != 'services') return values;

		// Move values with children to the end of the list.
		var len = values.length;
		for (var i = 0; i < len; ++i) {
			if (values[0].services) {
				values.push(values[0]);
				values.splice(0, 1);
			}
		}

		return values;
	}
});

pion.system.getHeight = function() {
	return 800;
}

pion.system.init = function() {
	dijit.byId('main_stack_container').resize({h: pion.system.getHeight()});

	if (file_protocol) {
		// Can't do much in this case....
		return;
	}
	dojo.xhrGet({
		url: '/config',
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			console.debug('in load()');
			if (dojo.isIE) {
				dojo.byId('platform_conf_file').innerHTML = response.getElementsByTagName('PlatformConfig')[0].xml;
				dojo.byId('vocab_conf_file').innerHTML    = response.getElementsByTagName('VocabularyConfig')[0].xml;
				dojo.byId('codec_conf_file').innerHTML    = response.getElementsByTagName('CodecConfig')[0].xml;
				dojo.byId('database_conf_file').innerHTML = response.getElementsByTagName('DatabaseConfig')[0].xml;
				dojo.byId('reactor_conf_file').innerHTML  = response.getElementsByTagName('ReactorConfig')[0].xml;
				dojo.byId('service_conf_file').innerHTML  = response.getElementsByTagName('ServiceConfig')[0].xml;
				dojo.byId('log_conf_file').innerHTML      = response.getElementsByTagName('LogConfig')[0].xml;
				dojo.byId('vocab_path').innerHTML         = response.getElementsByTagName('VocabularyPath')[0].xml;
			} else {
				dojo.byId('platform_conf_file').innerHTML = response.getElementsByTagName('PlatformConfig')[0].textContent;
				dojo.byId('vocab_conf_file').innerHTML    = response.getElementsByTagName('VocabularyConfig')[0].textContent;
				dojo.byId('codec_conf_file').innerHTML    = response.getElementsByTagName('CodecConfig')[0].textContent;
				dojo.byId('database_conf_file').innerHTML = response.getElementsByTagName('DatabaseConfig')[0].textContent;
				dojo.byId('reactor_conf_file').innerHTML  = response.getElementsByTagName('ReactorConfig')[0].textContent;
				dojo.byId('service_conf_file').innerHTML  = response.getElementsByTagName('ServiceConfig')[0].textContent;
				dojo.byId('log_conf_file').innerHTML      = response.getElementsByTagName('LogConfig')[0].textContent;
				dojo.byId('vocab_path').innerHTML         = response.getElementsByTagName('VocabularyPath')[0].textContent;
			}

			// in the plugin paths table, save the first placeholder row node for cloning and then remove all rows
			var plugin_paths_table = dojo.byId('plugin_paths');
			var row_node_to_clone = plugin_paths_table.getElementsByTagName('tr')[0];
			while (plugin_paths_table.firstChild) {
				plugin_paths_table.removeChild(plugin_paths_table.firstChild);
			}

			var plugin_paths = response.getElementsByTagName('PluginPath');
			var row_nodes = [];
			for (var i = 0; i < plugin_paths.length; ++i) {
				if (dojo.isIE) {
					row_nodes[i] = plugin_paths_table.insertRow();
					dojo.forEach(row_node_to_clone.childNodes, function(n){row_nodes[i].appendChild(dojo.clone(n));});
				} else {
					row_nodes[i] = dojo.clone(row_node_to_clone);
					plugin_paths_table.appendChild(row_nodes[i]);
				}
				row_nodes[i].getElementsByTagName('label')[0].innerHTML = 'Plug-In Path ' + (i + 1);
				var plugin_path = dojo.isIE? plugin_paths[i].xml : plugin_paths[i].textContent;
				row_nodes[i].getElementsByTagName('td')[1].innerHTML = plugin_path;
			}
			return response;
		},
		error: function(response, ioArgs) {
			console.error('HTTP status code: ', ioArgs.xhr.status);
			return response;
		}
	});

	dojo.byId('platform_conf_file').firstChild.nodeValue = 'actual/path/here/PlatformConfigFile.xml';

	//server_store = new childlessChildrenFirstStore({url: 'serverTree.json'});
	//server_store.fetch({queryOptions: {deep: true}, onItem: handleServerTreeItem, onComplete: buildTree});
	server_store = new dojox.data.XmlStore({url: '/config/services'});

	// dijit.Tree requires dojo.data.api.Identity support, although it only uses getIdentity()
	server_store.getFeatures = function() {
		return {
			 'dojo.data.api.Read': true,
			 'dojo.data.api.Identity': true
		};
	}
	server_store.getIdentity = function(item) {
		console.debug("server_store.getValue(item, '@id') = ", server_store.getValue(item, '@id'));
		console.debug("server_store.getAttributes(item) = ", server_store.getAttributes(item));
		// This is not unique, since most items don't have attribute @id, but somehow it works.
		// If we need to use features that require unique identities, we'll have to generate them somehow.
		return server_store.getValue(item, '@id');
	}

	var server_tree = new dijit.Tree({
		store: server_store,
		childrenAttr: ['childNodes'],
		getLabel: function(item) {
			var label = server_store.getValue(item, 'tagName');
			
			// Because @id is the identity attribute, the following returns null rather than undefined if the item doesn't have attribute @id.
			// (Also, server_store.hasAttribute(item, '@id') always returns true, even if getAttributes(item) doesn't include @id.)
			var id = server_store.getValue(item, '@id');
			
			if (id) {
				return label + ': ' + id;
			}
			if (label == 'Option') {
				label += ' ' + server_store.getValue(item, '@name');
			}
			if (server_store.hasAttribute(item, 'text()')) {
				return label + ': ' + server_store.getValue(item, 'text()');
			}
			return label;
		}
	}, dojo.byId('server_tree'));
}

function handleServerTreeItem(item, request) {
	var attrs = server_store.getAttributes(item);
	console.debug('got item with attributes ', attrs);
	for (var i = 0; i < attrs.length; ++i) {
		var attr = attrs[i];
		if (attr != 'name' && attr != 'services') {
			server_store.newItem({name: attr + ': ' + server_store.getValue(item, attr)}, {parent: item, attribute: 'services'});
		}
	}
}

function buildTree() {
	var server_tree = new dijit.Tree({store: server_store, labelAttr:"name", childrenAttr:["services"]}, dojo.byId('server_tree'));
}
