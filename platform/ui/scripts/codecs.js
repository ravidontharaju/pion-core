dojo.provide("pion.codecs");
dojo.require("plugins.codecs.Codec");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.grid.Grid");

var selected_codec_pane = null;
var codec_config_store;          // one item per codec

pion.codecs.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.codecs.height;
}

pion.codecs.config_store = new dojox.data.XmlStore({url: '/config/codecs'});

// fetchItemByIdentity and getIdentity are needed for FilteringSelect.
pion.codecs.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.codecs.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem});
}
pion.codecs.config_store.getIdentity = function(item) {
	return pion.codecs.config_store.getValue(item, '@id');
}

pion.codecs.init = function() {
	codec_config_store = pion.codecs.config_store;

	var url = dojo.moduleUrl('plugins', 'codecs.json');
	pion.codecs.plugin_data_store = new dojo.data.ItemFileReadStore({url: url});

	dojo.subscribe("codec_config_accordion-selectChild", codecPaneSelected);

	function onComplete(items, request){
		var config_accordion = dijit.byId('codec_config_accordion');
		for (var i = 0; i < items.length; ++i) {
			var title = pion.codecs.config_store.getValue(items[i], 'Name');
			var codec_pane = createNewCodecPane(title);
			codec_pane.config_item = items[i];
			codec_pane.uuid = pion.codecs.config_store.getValue(items[i], '@id');
			config_accordion.addChild(codec_pane);
		}
		pion.codecs._adjustAccordionSize();

		var first_pane = config_accordion.getChildren()[0];
		config_accordion.selectChild(first_pane);
	}	

	if (file_protocol) {
		dijit.byId('codec_config_accordion').removeChild(selected_codec_pane);
	} else {
		codec_config_store.fetch({ onComplete: onComplete });
	}

	dojo.connect(dojo.byId('add_new_codec_button'), 'click', addNewCodec);
}

function createNewCodecPane(title) {
	var codec_pane_node = document.createElement('span');
	var codec_pane = new plugins.codecs.CodecPane({ 'class': 'codec_pane', title: title }, codec_pane_node);
	return codec_pane;
}

function addNewCodec() {
	var dialog = new plugins.codecs.CodecInitDialog({title: 'Add New Codec'});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel');
	});
	dialog.show();
	dialog.execute = function(dialogFields) {
		console.debug(dialogFields);
		var post_data = '<PionConfig><Codec>';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
		}
		post_data += '</Codec></PionConfig>';
		console.debug('post_data: ', post_data);
		
		dojo.rawXhrPost({
			url: '/config/codecs',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response){
				var node = response.getElementsByTagName('Codec')[0];
				var id = node.getAttribute('id');
				console.debug('id (from server): ', id);
				var codec = new plugins.codecs.Codec(id, dialogFields);
				var codec_config_accordion = dijit.byId('codec_config_accordion');
				var codec_pane = createNewCodecPane(dialogFields.Name);
				codec_pane.uuid = id;
				codec_config_accordion.addChild(codec_pane);
				pion.codecs._adjustAccordionSize();
				codec_config_accordion.selectChild(codec_pane);
			},
			error: function(response, ioArgs) {
				console.error('Error from rawXhrPost to /config/codecs.  HTTP status code: ', ioArgs.xhr.status);
				return response;
			}
		});
	}
}

pion.codecs._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('codec_config_accordion');
	var num_codecs = config_accordion.getChildren().length;
	console.debug("num_codecs = " + num_codecs);

	// TODO: replace 475 with some computed value, which takes into account the height of the grid 
	// (in .codec_grid in defaults.css) and the variable comment box height.
	var codec_pane_body_height = 475;

	var title_height = 0;
	if (num_codecs > 0) {
		var first_pane = config_accordion.getChildren()[0];
		title_height = first_pane.getTitleHeight();
	}
	var accordion_height = codec_pane_body_height + num_codecs * title_height;

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	var accordion_width = config_accordion.domNode.clientWidth - 15;

	config_accordion.resize({h: accordion_height, w: accordion_width});

	// TODO: replace 160 with some computed value  (see adjustUserAccordionSize)
	pion.codecs.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.codecs.height});
}

function codecPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	if (pane == selected_codec_pane) {
		return;
	}
	if (selected_codec_pane && dojo.hasClass(selected_codec_pane.domNode, 'unsaved_changes')) {
		var dialog = dijit.byId('unsaved_changes_dialog');
		dialog.show();
		
		// Return to the previously selected pane.
		setTimeout("dijit.byId('codec_config_accordion').selectChild(selected_codec_pane)", 500);
		return;
	}

	selected_codec_pane = pane;
	console.debug('Fetching item ', pane.uuid);
	var store = pion.codecs.config_store;
	store.fetch({
		query: {'@id': pane.uuid},
		onItem: function(item) {
			console.debug('item: ', item);
			pane.populateFromConfigItem(item);
		}
	});
}
