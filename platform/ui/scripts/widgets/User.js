dojo.provide("pion.widgets.User");
dojo.require("pion.users");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");

dojo.declare("pion.widgets.UserInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("pion", "widgets/UserInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("pion.widgets.UserPane",
	[dijit.layout.ContentPane, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/UserPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			for (var id in pion.services.labels_by_tab_id) {
				var check_box_div = document.createElement('div');
				this.visible_service_tabs.appendChild(check_box_div);
				new dijit.form.CheckBox({name: 'tab_check_boxes', value: id}, check_box_div);
				var label_div = dojo.create('label', {innerHTML: 'Show ' + pion.services.labels_by_tab_id[id] + ' tab'});
				this.visible_service_tabs.appendChild(label_div);
				this.visible_service_tabs.appendChild(dojo.create('br'));
			}
		},
		getHeight: function() {
			// TODO: replace with some computed value
			return dojo.isIE? 225 : 205;
		},
		populateFromConfigItem: function(item) {
			var store = pion.users.config_store;
			var config = {};
			var attributes = store.getAttributes(item);
			for (var i = 0; i < attributes.length; ++i) {
				if (attributes[i] != 'Permit' && attributes[i] != 'tagName' && attributes[i] != 'childNodes') {
					config[attributes[i]] = store.getValue(item, attributes[i]).toString();
				}
			}
			config.tab_check_boxes = [];
			dojo.forEach(store.getValues(item, 'Permit'), function(p_item) {
				config.tab_check_boxes.push(pion.tab_ids_by_resource[p_item.toString()]);
			});
			console.dir(config);
			this.form.attr('value', config);

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		save: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			var config = this.form.attr('value');

			var put_data = '<PionConfig><User>';
			for (var tag in config) {
				if (tag != '@id' && tag != 'tab_check_boxes') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += pion.makeXmlLeafElement(tag, config[tag]);
				}
			}
			dojo.forEach(config.tab_check_boxes, function(tab_id) {
				put_data += '<Permit>' + pion.resources_by_tab_id[tab_id] + '</Permit>';
			});
			put_data += '</User></PionConfig>';
			console.debug('put_data: ', put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/users/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item.
					pion.users.config_store.fetch({
						query: {'@id': _this.uuid},
						onItem: function(item) {
							_this.config_item = item;
							_this.populateFromConfigItem(item);
						},
						onError: pion.handleFetchError
					});
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		cancel: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete2: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected user is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/users/' + this.uuid,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/users/' + this.uuid, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('user_config_accordion').forward();

					dijit.byId('user_config_accordion').removeChild(_this);
					pion.users._adjustAccordionSize();

					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		// TODO: Add a callback for all checkboxes, to issue a warning in the case that the box is being unchecked and will result in all boxes being unchecked.
		_warnIfDisablingSelf: function(e) {
			// TODO: If unchecking 'Users', and the selected user is the currently logged in user,
			// warn that they will not be able to access any user settings, including their own,
			// through the UI, and ask for confirmation.
		},
		user: ''
	}
);
