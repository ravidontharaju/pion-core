dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");

var system_pane_title_height = -1;
var system_pane_body_height = 350;
var accordion_width = -1;
var unique_system_id = 1;
var selected_system_pane = null;
var default_system_data;

function initSystemConfigPage() {
	var first_plugin_path_node = plugin_path_list.getAllNodes()[0];
	var button_node = dojo.query('button', first_plugin_path_node)[0];
	dojo.connect(button_node, 'click', function() {
		plugin_path_list.delItem(first_plugin_path_node.id);
		dojo._destroyElement(first_plugin_path_node);
	})
	var input_node = dojo.query('input', first_plugin_path_node)[0];
	input_node.style.width = (plugin_path_list.node.clientWidth - 150) + 'px';

	var save_button = dojo.byId('save_conf_file_paths');
	dojo.connect(save_button, 'click', function() {
		console.debug('vocab_conf_file_widget.fileInput.value = ', vocab_conf_file_widget.fileInput.value);
		console.debug('codec_conf_file_widget.fileInput.value = ', codec_conf_file_widget.fileInput.value);
		console.debug('database_conf_file_widget.fileInput.value = ', database_conf_file_widget.fileInput.value);
		console.debug('reactor_conf_file_widget.fileInput.value = ', reactor_conf_file_widget.fileInput.value);
		console.debug('user_conf_file_widget.fileInput.value = ', user_conf_file_widget.fileInput.value);
	})
}

function plugin_path_dnd_item_creator(item, hint){
/*
	<div class="dojoDndItem" style="background-color: #ecf5f6">
		<button dojoType=dijit.form.Button class="delete" style="float: right">Delete</button>
		<input dojoType="dijit.form.TextBox" value="Path A" />
	</div>
*/
	var node = dojo.doc.createElement('div');
	node.style.backgroundColor = '#ecf5f6';
	var button = new dijit.form.Button({'class': 'delete_row', style: 'float: right'});
	dojo.connect(button.domNode, 'click', function() {
		plugin_path_list.delItem(node.id);
		dojo._destroyElement(node);
	})
	var text_box_style = 'width: ' + (plugin_path_list.node.clientWidth - 150) + 'px';
	var text_box = new dijit.form.TextBox({name: 'path', value: 'new path', style: text_box_style});
	node.appendChild(button.domNode);
	node.appendChild(text_box.domNode);
	node.id = dojo.dnd.getUniqueId();
	return {node: node, data: item, type: []};
};

function addNewPluginPath() {
	plugin_path_list.creator = plugin_path_dnd_item_creator;
	plugin_path_list.insertNodes(false, [{}]);
}
