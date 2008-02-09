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

function initSystemConfigPage() {
	dojo.byId('platform_conf_file').firstChild.nodeValue = 'actual/path/here/PlatformConfigFile.xml';
	dojo.byId('vocab_conf_file').firstChild.nodeValue = 'actual/path/here/VocabulariesConfigFile.xml';
	dojo.byId('codec_conf_file').firstChild.nodeValue = 'actual/path/here/CodecsConfigFile.xml';
	dojo.byId('database_conf_file').firstChild.nodeValue = 'actual/path/here/DatabasesConfigFile.xml';
	dojo.byId('reactor_conf_file').firstChild.nodeValue = 'actual/path/here/ReactorsConfigFile.xml';
	dojo.byId('service_conf_file').firstChild.nodeValue = 'actual/path/here/ServicesConfigFile.xml';

	dojo.byId('vocab_path').firstChild.nodeValue = 'actual/path/here/VocabularyPath';

	var plugin_paths_list = dojo.byId('plugin_paths');
	// TODO: create new table rows to replace the placeholders.
	/*
	while (plugin_paths_list.firstChild) {
		plugin_paths_list.removeChild(plugin_paths_list.firstChild);
	}
	*/
	/*
	<tr>
        <td width="20%">&nbsp;</td>
        <td width="80%">your/path/here/PluginPath</td>
    </tr>
    */
    /*
	var plugin_path = document.createElement('li');
	plugin_path.appendChild(document.createTextNode('first/path/to/search'));
	plugin_paths_list.appendChild(plugin_path);
	var plugin_path_2 = document.createElement('li');
	plugin_path_2.appendChild(document.createTextNode('second/path/to/search'));
	plugin_paths_list.appendChild(plugin_path_2);
	*/
	
	server_store = new childlessChildrenFirstStore({url: "serverTree.json"});
	server_store.fetch({queryOptions: {deep: true}, onItem: handleServerTreeItem, onComplete: buildTree});
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
