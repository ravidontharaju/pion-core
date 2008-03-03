dojo.provide("plugins.databases.Database");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");

dojo.declare("plugins.databases.Database",
	[],
	{
		constructor: function(uuid, args) {
			this.uuid = uuid;
			dojo.mixin(this, args);
			plugins.databases.databases_by_id[uuid] = this;
			var store = pion.databases.plugin_data_store;
			var _this = this;
			store.fetchItemByIdentity({
				identity: this.Plugin,
				onItem: function(item) {
					_this.label = store.getValue(item, 'label');
				}
			});
		}
	}
);

plugins.databases.databases_by_id = {};

dojo.declare("plugins.databases.DatabaseInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/DatabaseInitDialog.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.databases.DatabasePane",
	[ dijit.layout.AccordionPane ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/DatabasePane.html"),
		templateString: "",       // Necessary to keep Dijit from using templateString in dijit.Dialog
		widgetsInTemplate: true,
		populateFromConfigItem: function(item) {
			var store = pion.databases.config_store;
			var form_data = {};
			form_data.name = store.getValue(item, 'Name');
			form_data.ID = store.getValue(item, '@id') || '';
			var xml_item = store.getValue(item, 'Comment');
			form_data.comment = (xml_item && xml_item.element.firstChild)? xml_item.element.firstChild.nodeValue : '';
			form_data.plugin_type = store.getValue(item, 'Plugin');

			var form = this.database_form;
			form.setValues(form_data);
			console.debug('form_data = ', form_data);
			this.title = form_data.name;
			var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', this.domNode)[0];
			title_node.firstChild.nodeValue = this.title;

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		setUnsavedChangesTrue: function() {
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		setUnsavedChangesFalse: function() {
			console.debug('removeClass');
			dojo.removeClass(this.domNode, 'unsaved_changes');
		},
		save: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');

			var form_data = this.database_form.getValues();
			var put_data = '<PionConfig><Database><Plugin>' + form_data.plugin_type
						 + '</Plugin><Name>' + form_data.name
						 + '</Name><Comment>' + form_data.comment
						 + '</Comment></Database></PionConfig>';
			console.debug('put_data: ', put_data);

			_this = this;
			dojo.rawXhrPut({
				url: '/config/databases/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item.
					pion.databases.config_store.fetch({
						query: {'@id': _this.uuid},
						onItem: function(item) {
							_this.config_item = item;
							_this.populateFromConfigItem(item);
						}
					});
				},
				error: function(response, ioArgs) {
					console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		},
		cancel: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete: selected database is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/databases/' + this.uuid,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = /config/databases/' + this.uuid, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('database_config_accordion').forward();
					
					dijit.byId('database_config_accordion').removeChild(_this);
					pion.databases._adjustAccordionSize();

					return response;
				},
				error: function(response, ioArgs) {
					console.error('HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});	
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		database: ''
	}
);
