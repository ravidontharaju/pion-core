dojo.provide("pion.users");
dojo.require("pion.widgets.User");
dojo.require("pion.widgets.ConfigAccordion");
dojo.require("dojox.data.XmlStore");

pion.users.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.users.user_config_height;
}

pion.users.config_store = new dojox.data.XmlStore({url: '/config/users'});

pion.users.init = function() {
	pion.users.selected_pane = null;
	pion.users.config_accordion = dijit.byId('user_config_accordion');
	pion.users.config_accordion.title_attribute = '@id';

	pion.users._replaceAccordionPane = function(old_pane) {
		var new_pane = new pion.widgets.UserPane({title: old_pane.title});
		new_pane.uuid = old_pane.uuid;
		new_pane.config_item = old_pane.config_item;
		new_pane.initialized = true;
	
		var config_accordion = dijit.byId("user_config_accordion");
		var idx = config_accordion.getIndexOfChild(old_pane);
		config_accordion.pendingSelection = new_pane;
		config_accordion.pendingRemoval = old_pane;
		config_accordion.addChild(new_pane, idx);
	}

	pion.users._updatePane = function(pane) {
		console.debug('Fetching item ', pane.uuid);
		var store = pion.users.config_store;
		store.fetch({
			query: {'@id': pane.uuid},
			onItem: function(item) {
				console.debug('item: ', item);
				pane.populateFromConfigItem(item);
			},
			onError: pion.handleFetchError
		});

		pion.users._adjustAccordionSize();
		dojo.style(pane.containerNode, "overflow", "hidden"); // For IE.
		// ???????????? Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	}

	function _paneSelected(pane) {
		console.debug('Selected ' + pane.title);

		var selected_pane = pion.users.selected_pane;
		if (pane == selected_pane) {
			return;
		}
		var config_accordion = dijit.byId("user_config_accordion");
		if (selected_pane && dojo.hasClass(selected_pane.domNode, 'unsaved_changes')) {
			var dialog = new dijit.Dialog({title: "Warning: unsaved changes"});
			dialog.attr('content', 'Please save or cancel unsaved changes before selecting another User.');
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
					pion.users._replaceAccordionPane(pane);
				else {
					pion.users.selected_pane = pane;
					pion.users._updatePane(pane);
				}
			},
			config_accordion.duration + 100
		);
	}

	function _paneAdded(pane) {
		var config_accordion = dijit.byId("user_config_accordion");
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

	function _paneRemoved(pane) {
	}

	dojo.subscribe("user_config_accordion-selectChild", _paneSelected);
	dojo.subscribe("user_config_accordion-addChild", _paneAdded);
	dojo.subscribe("user_config_accordion-removeChild", _paneRemoved);

	pion.users.createNewPaneFromStore = function(id, user_config_page_is_selected) {
		pion.users.config_store.fetch({
			query: {'@id': id},
			onItem: function(item) {
				var user_pane = pion.users.config_accordion.createNewPaneFromItem(item, pion.users.config_store);
				if (user_config_page_is_selected) {
					pion.users._adjustAccordionSize();
					dijit.byId('user_config_accordion').selectChild(user_pane);
				}
			},
			onError: pion.handleFetchError
		});
	}

	function onComplete(items, request) {
		pion.users.config_accordion.createPanesFromAllItems(items, pion.users.config_store);
	}

	pion.users.config_store.fetch({ onComplete: onComplete, onError: pion.handleFetchError });

	function addNewUser() {
		var dialog = new pion.widgets.UserInitDialog();

		// Set the focus to the first input field, with a delay so that it doesn't get overridden.
		setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

		dialog.show();
		dialog.execute = function(dialogFields) {
			if (this.execute_already_called) { console.debug('See http://trac.atomiclabs.com/ticket/685.'); return; }
			this.execute_already_called = true;

			// TODO: override pion.users.config_store._getPostContent() (see XmlStore._getPostContent())
			// with the code below to build the post data.
			// Then we can get rid of createNewPaneFromStore(), and do the following here:
			// 		var item = pion.users.config_store.newItem({...});
			// 		pion.users.createNewPaneFromItem(item);

			console.debug(dialogFields);
			var id = dialogFields['@id'];
			delete dialogFields['@id'];
			var post_data = '<PionConfig><User id="' + pion.escapeXml(id) + '">';
			for (var tag in dialogFields) {
				console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
				post_data += pion.makeXmlLeafElement(tag, dialogFields[tag]);
			}
			for (var resource in pion.tab_ids_by_resource) {
				post_data += '<Permit>' + resource + '</Permit>';
			}
			post_data += '</User></PionConfig>';
			console.debug('post_data: ', post_data);

			dojo.rawXhrPost({
				url: '/config/users',
				contentType: "text/xml",
				handleAs: "xml",
				postData: post_data,
				load: function(response){
					pion.users.createNewPaneFromStore(id, true);
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
			});
		}
	}

	dojo.connect(dojo.byId('add_new_user_button'), 'click', addNewUser);
}

pion.users._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('user_config_accordion');
	var accordion_height = pion.users.selected_pane.getHeight();
	dojo.forEach(config_accordion.getChildren(), function(pane) {
		accordion_height += pane._buttonWidget.getTitleHeight();
	});
	config_accordion.resize({h: accordion_height});

	// Node 'user_config_end' has the following properties: its offsetParent is node 'user_config' and it 
	// has 0 height and margins.  Thus, its offsetTop is equal to the exact height needed by node 'user_config'.
	pion.users.user_config_height = dojo.byId('user_config_end').offsetTop;

	dijit.byId('main_stack_container').resize({h: pion.users.user_config_height});
}
