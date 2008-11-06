dojo.provide("pion.codecs");
dojo.require("plugins.codecs.Codec");
dojo.require("dojox.data.XmlStore");

dojo.require("plugins.codecs.LogCodec");

var selected_codec_pane = null;
var codec_config_store;          // one item per codec

pion.codecs.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.codecs.height;
}

pion.codecs.config_store = new dojox.data.XmlStore({url: '/config/codecs'});

// fetchItemByIdentity and getIdentity are needed for FilteringSelect.
pion.codecs.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.codecs.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem, onError: pion.handleFetchError});
}
pion.codecs.config_store.getIdentity = function(item) {
	return pion.codecs.config_store.getValue(item, '@id');
}

pion.codecs.init = function() {
	codec_config_store = pion.codecs.config_store;

	var url = dojo.moduleUrl('plugins', 'codecs.json');
	pion.codecs.plugin_data_store = new dojo.data.ItemFileReadStore({url: url});

	dojo.subscribe("codec_config_accordion-selectChild", codecPaneSelected);

	pion.codecs.createNewPaneFromItem = function(item) {
		var title = pion.codecs.config_store.getValue(item, 'Name');
		var plugin = pion.codecs.config_store.getValue(item, 'Plugin');
		var codec_pane_node = document.createElement('span');
		var pane_class_name = 'plugins.codecs.' + plugin + 'Pane';
		var pane_class = dojo.getObject(pane_class_name);
		if (pane_class) {
			console.debug('found class ', pane_class_name);
			var codec_pane = new pane_class({ 'class': 'codec_pane', title: title }, codec_pane_node);
		} else {
			console.debug('class ', pane_class_name, ' not found; using plugins.codecs.CodecPane instead.');
			var codec_pane = new plugins.codecs.CodecPane({ 'class': 'codec_pane', title: title }, codec_pane_node);
		}
		codec_pane.config_item = item;
		codec_pane.uuid = pion.codecs.config_store.getValue(item, '@id');
		dijit.byId('codec_config_accordion').addChild(codec_pane);
		return codec_pane;
	}
	
	pion.codecs.createNewPaneFromStore = function(id, codec_config_page_is_selected) {
		pion.codecs.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var codec_pane = pion.codecs.createNewPaneFromItem(item);
				if (codec_config_page_is_selected) {
					pion.codecs._adjustAccordionSize();
					dijit.byId('codec_config_accordion').selectChild(codec_pane);
				}
			},
			onError: pion.handleFetchError
		});
	}

	function onComplete(items, request){
		var config_accordion = dijit.byId('codec_config_accordion');
		for (var i = 0; i < items.length; ++i) {
			pion.codecs.createNewPaneFromItem(items[i]);
		}
		var first_pane = config_accordion.getChildren()[0];
		config_accordion.selectChild(first_pane);
	}

	if (file_protocol) {
		dijit.byId('codec_config_accordion').removeChild(selected_codec_pane);
	} else {
		codec_config_store.fetch({ onComplete: onComplete, onError: pion.handleFetchError });
	}

	dojo.connect(dojo.byId('add_new_codec_button'), 'click', addNewCodec);
}

function addNewCodec() {
	var dialog = new plugins.codecs.CodecInitDialog({title: 'Add New Codec'});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
	dialog.execute = function(dialogFields) {
		console.debug(dialogFields);
		var post_data = '<PionConfig><Codec>';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
		}
		if (plugins.codecs[dialogFields.Plugin] && plugins.codecs[dialogFields.Plugin].custom_post_data) {
			post_data += plugins.codecs[dialogFields.Plugin].custom_post_data;
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
				pion.codecs.createNewPaneFromStore(id, true);
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	}
}

pion.codecs._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('codec_config_accordion');
	var num_codecs = config_accordion.getChildren().length;
	console.debug("num_codecs = " + num_codecs);

	var codec_pane_body_height = selected_codec_pane.getHeight();
	var title_height = 0;
	if (num_codecs > 0) {
		var first_pane = config_accordion.getChildren()[0];
		title_height = first_pane.getTitleHeight();
	}
	var accordion_height = codec_pane_body_height + num_codecs * title_height;
	config_accordion.resize({h: accordion_height});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.codecs.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.codecs.height});
}

function codecPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	if (pane == selected_codec_pane) {
		return;
	}
	if (selected_codec_pane && dojo.hasClass(selected_codec_pane.domNode, 'unsaved_changes')) {
		var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
		dialog.setContent('Please save or cancel unsaved changes before selecting another Codec.');
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
		},
		onError: pion.handleFetchError
	});

	// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	var slide_duration = dijit.byId('codec_config_accordion').duration;
	setTimeout(function() {
					dojo.style(pane.containerNode, "overflow", "hidden");
					pion.codecs._adjustAccordionSize();
			   },
			   slide_duration + 50);
}
