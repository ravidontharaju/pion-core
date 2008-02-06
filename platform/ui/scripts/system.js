dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Tree");

function initSystemConfigPage() {
	dojo.byId('platform_conf_file').firstChild.nodeValue = 'actual/path/here/PlatformConfigFile.xml';
	dojo.byId('vocab_conf_file').firstChild.nodeValue = 'actual/path/here/VocabulariesConfigFile.xml';
	dojo.byId('codec_conf_file').firstChild.nodeValue = 'actual/path/here/CodecsConfigFile.xml';
	dojo.byId('database_conf_file').firstChild.nodeValue = 'actual/path/here/DatabasesConfigFile.xml';
	dojo.byId('reactor_conf_file').firstChild.nodeValue = 'actual/path/here/ReactorsConfigFile.xml';
	dojo.byId('service_conf_file').firstChild.nodeValue = 'actual/path/here/ServicesConfigFile.xml';

	dojo.byId('vocab_path').firstChild.nodeValue = 'actual/path/here/VocabularyPath';

	var plugin_paths_list = dojo.byId('plugin_paths');
	while (plugin_paths_list.firstChild) {
		plugin_paths_list.removeChild(plugin_paths_list.firstChild);
	}
	var plugin_path = document.createElement('li');
	plugin_path.appendChild(document.createTextNode('first/path/to/search'));
	plugin_paths_list.appendChild(plugin_path);
	var plugin_path_2 = document.createElement('li');
	plugin_path_2.appendChild(document.createTextNode('second/path/to/search'));
	plugin_paths_list.appendChild(plugin_path_2);

	server_store.fetch({sort: [{attribute: 'order', descending: true}], queryOptions: {deep: true}, onItem: handleServerTreeItem, onComplete: rebuildTree});
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

function rebuildTree() {
	/*
	TODO: Make the leaves for the server attributes come before the service nodes.  This will probably mean deleting the service items
	and recreating them, so they come after the leaves created by handleServerTreeItem.
	*/
}
