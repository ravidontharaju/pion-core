dojo.provide("pion.codecs");
dojo.require("pion.widgets.ConfigAccordion");
dojo.require("plugins.codecs.Codec");
dojo.require("dojox.data.XmlStore");

dojo.require("plugins.codecs.LogCodec");
dojo.require("plugins.codecs.XMLCodec");

pion.codecs.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.codecs.height;
}

pion.codecs.config_store = new dojox.data.XmlStore({url: '/config/codecs'});

// fetchItemByIdentity and getIdentity are needed for dijit.form.FilteringSelect and pion.widgets.SimpleSelect.
pion.codecs.config_store.fetchItemByIdentity = function(keywordArgs) {
	pion.codecs.config_store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem, onError: pion.handleFetchError});
}
pion.codecs.config_store.getIdentity = function(item) {
	return pion.codecs.config_store.getValue(item, '@id');
}

pion.codecs.init = function() {
	pion.codecs.selected_pane = null;
	pion.codecs.config_accordion = dijit.byId('codec_config_accordion');

	var url = dojo.moduleUrl('plugins', 'codecs.json');
	pion.codecs.plugin_data_store = new dojo.data.ItemFileReadStore({url: url});

	dojo.subscribe("codec_config_accordion-selectChild", codecPaneSelected);
	dojo.subscribe("codec_config_accordion-addChild", codecPaneAdded);
	dojo.subscribe("codec_config_accordion-removeChild", codecPaneRemoved);

	pion.codecs.createNewPaneFromStore = function(id, codec_config_page_is_selected) {
		pion.codecs.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var codec_pane = pion.codecs.config_accordion.createNewPaneFromItem(item, pion.codecs.config_store);
				if (codec_config_page_is_selected) {
					pion.codecs._adjustAccordionSize();
					dijit.byId('codec_config_accordion').selectChild(codec_pane);
				}
			},
			onError: pion.getFetchErrorHandler('fetch() called by pion.codecs.createNewPaneFromStore()')
		});
	}

	function onComplete(items, request) {
		pion.codecs.config_accordion.createPanesFromAllItems(items, pion.codecs.config_store);
	}

	pion.codecs.config_store.fetch({ onComplete: onComplete, onError: pion.getFetchErrorHandler('fetch() called by pion.codecs.init()') });

	dojo.connect(dojo.byId('add_new_codec_button'), 'click', addNewCodec);
}

function addNewCodec() {
	var dialog = new plugins.codecs.CodecInitDialog({title: 'Add New Codec'});

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dialog.show();
	dialog.execute = function(dialogFields) {
		if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
		this.execute_already_called = true;

		console.debug(dialogFields);
		var post_data = '<PionConfig><Codec>';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
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
	var accordion_height = pion.codecs.selected_pane.getHeight();
	dojo.forEach(config_accordion.getChildren(), function(pane) {
		accordion_height += pane._buttonWidget.getTitleHeight();
	});
	config_accordion.resize({h: accordion_height});

	// TODO: replace 160 with some computed value  (see pion.users._adjustAccordionSize)
	pion.codecs.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.codecs.height});
}

function replaceCodecAccordionPane(old_pane) {
	var plugin = pion.codecs.config_store.getValue(old_pane.config_item, 'Plugin');
	var pane_class_name = 'plugins.codecs.' + plugin + 'Pane';
	var pane_class = dojo.getObject(pane_class_name);
	if (pane_class) {
		console.debug('found class ', pane_class_name);
		var new_pane = new pane_class({title: old_pane.title});
	} else {
		console.debug('class ', pane_class_name, ' not found; using plugins.codecs.CodecPane instead.');
		var new_pane = new plugins.codecs.CodecPane({title: old_pane.title});
	}
	new_pane.uuid = old_pane.uuid;
	new_pane.config_item = old_pane.config_item;
	new_pane.initialized = true;

	var config_accordion = dijit.byId('codec_config_accordion');
	var idx = config_accordion.getIndexOfChild(old_pane);
	config_accordion.pendingSelection = new_pane;
	config_accordion.pendingRemoval = old_pane;
	config_accordion.addChild(new_pane, idx);
}

function updateCodecPane(pane) {
	console.debug('Fetching item ', pane.uuid);
	var store = pion.codecs.config_store;
	store.fetch({
		query: {'@id': pane.uuid},
		onItem: function(item) {
			console.debug('item: ', item);
			pane.populateFromConfigItem(item);
		},
		onError: pion.getFetchErrorHandler('fetch() called by codecPaneSelected()')
	});

	pion.codecs._adjustAccordionSize();
	dojo.style(pane.containerNode, "overflow", "hidden"); // For IE.
	// ???????????? Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
}

function codecPaneSelected(pane) {
	console.debug('Selected ' + pane.title);
	var selected_pane = pion.codecs.selected_pane;
	if (pane == selected_pane) {
		return;
	}
	var config_accordion = dijit.byId("codec_config_accordion");
	if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
		var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
		dialog.attr('content', 'Please save or cancel unsaved changes before selecting another Codec.');
		dialog.show();

		// Return to the previously selected pane.
		setTimeout(function(){config_accordion.selectChild(selected_pane);}, 500);
		return;
	}
	setTimeout(
		function() {
			if (config_accordion.pendingRemoval) {
				config_accordion.removeChild(config_accordion.pendingRemoval);
				config_accordion.pendingRemoval = false;
			}
			if (! pane.initialized)
				// The selected pane is just a placeholder, so now replace it with the real thing.  The new pane will 
				// then be selected, causing this function to be called again, this time with pane.initialized = true;
				replaceCodecAccordionPane(pane);
			else {
				pion.codecs.selected_pane = pane;
				updateCodecPane(pane);
			}
		},
		config_accordion.duration + 100
	);
}

function codecPaneAdded(pane) {
	console.debug("Added " + pane.title);
	var config_accordion = dijit.byId("codec_config_accordion");
	setTimeout(
		function() {
			if (config_accordion.pendingSelection) {
				config_accordion.selectChild(config_accordion.pendingSelection);
				config_accordion.pendingSelection = false;
			}
		},
		config_accordion.duration // Duration shouldn't be relevant here, but what should this be???
	);
}

function codecPaneRemoved(pane) {
	console.debug("Removed " + pane.title);
}
