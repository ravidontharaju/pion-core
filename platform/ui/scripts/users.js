dojo.provide("pion.users");
dojo.require("pion.widgets.User");
dojo.require("dojox.data.XmlStore");

var selected_user_pane = null;

pion.users.getHeight = function() {
	// set by _adjustAccordionSize
	return pion.users.height;
}

pion.users.config_store = new dojox.data.XmlStore({url: '/config/users'});

pion.users.init = function() {
	var url = dojo.moduleUrl('plugins', 'users.json');
	pion.users.plugin_data_store = new dojo.data.ItemFileReadStore({url: url});

	dojo.subscribe("user_config_accordion-selectChild", userPaneSelected);

	function onComplete(items, request){
		var config_accordion = dijit.byId('user_config_accordion');
		for (var i = 0; i < items.length; ++i) {
			var title = pion.users.config_store.getValue(items[i], '@id');
			var user_pane = createNewUserPane(title);
			user_pane.config_item = items[i];
			user_pane.uuid = pion.users.config_store.getValue(items[i], '@id');
			config_accordion.addChild(user_pane);
		}
		pion.users._adjustAccordionSize();

		var first_pane = config_accordion.getChildren()[0];
		config_accordion.selectChild(first_pane);
	}

	if (file_protocol) {
		dijit.byId('user_config_accordion').removeChild(selected_user_pane);
	} else {
		pion.users.config_store.fetch({ onComplete: onComplete, onError: pion.handleFetchError });
	}

	dojo.connect(dojo.byId('add_new_user_button'), 'click', addNewUser);
}

function createNewUserPane(title) {
	var user_pane_node = document.createElement('span');
	var user_pane = new pion.widgets.UserPane({'class': 'user_pane', title: title}, user_pane_node);
	return user_pane;
}

function addNewUser() {
	var dialog = new pion.widgets.UserInitDialog();

	// Set the focus to the first input field, with a delay so that it doesn't get overridden.
	setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

	dojo.query(".dijitButton.cancel", dialog.domNode).forEach(function(n) {
		dojo.connect(n, 'click', dialog, 'onCancel')
	});
	dialog.show();
	dialog.execute = function(dialogFields) {
		console.debug(dialogFields);
		var id = dialogFields['@id'];
		delete dialogFields['@id'];
		var post_data = '<PionConfig><User id="' + id + '">';
		for (var tag in dialogFields) {
			console.debug('dialogFields[', tag, '] = ', dialogFields[tag]);
			post_data += '<' + tag + '>' + dialogFields[tag] + '</' + tag + '>';
		}
		post_data += '</User></PionConfig>';
		console.debug('post_data: ', post_data);

		dojo.rawXhrPost({
			url: '/config/users',
			contentType: "text/xml",
			handleAs: "xml",
			postData: post_data,
			load: function(response){
				var config_accordion = dijit.byId('user_config_accordion');
				var user_pane = createNewUserPane(id);
				user_pane.uuid = id;
				config_accordion.addChild(user_pane);
				pion.users._adjustAccordionSize();
				config_accordion.selectChild(user_pane);
			},
			error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
		});
	}
}

pion.users._adjustAccordionSize = function() {
	var config_accordion = dijit.byId('user_config_accordion');
	var num_users = config_accordion.getChildren().length;
	console.debug("num_users = " + num_users);

	var user_pane_body_height = 210;
	var title_height = 0;
	if (num_users > 0) {
		var first_pane = config_accordion.getChildren()[0];
		title_height = first_pane.getTitleHeight();
	}
	var accordion_height = user_pane_body_height + num_users * title_height;

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	var accordion_width = config_accordion.domNode.clientWidth - 15;

	config_accordion.resize({h: accordion_height, w: accordion_width});

	// TODO: replace 160 with some computed value
	// I tried dojo.byId('user_config_header').offsetHeight + dojo.byId('user_config_controls').offsetHeight,
	// but it's not enough, maybe because of padding.
	pion.users.height = accordion_height + 160;
	dijit.byId('main_stack_container').resize({h: pion.users.height});
}

function userPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	if (pane == selected_user_pane) {
		return;
	}
	if (selected_user_pane && dojo.hasClass(selected_user_pane.domNode, 'unsaved_changes')) {
		var dialog = dijit.byId('unsaved_changes_dialog');
		dialog.show();

		// Return to the previously selected pane.
		setTimeout("dijit.byId('user_config_accordion').selectChild(selected_user_pane)", 500);
		return;
	}

	selected_user_pane = pane;
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

	// Wait until after dijit.layout.AccordionContainer._transition has set overflow: "auto", then change it back to "hidden".
	var slide_duration = dijit.byId('user_config_accordion').duration;
	setTimeout(function(){dojo.style(pane.containerNode, "overflow", "hidden")}, slide_duration + 50);
}

dojo.subscribe("user_config_accordion-selectChild", userPaneSelected);
