dojo.provide("plugins.databases.Database");
dojo.require("pion.databases");
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
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.databases.DatabasePane",
	[ dijit.layout.AccordionPane ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/DatabasePane.html"),
		widgetsInTemplate: true,
		populateFromConfigItem: function(item) {
			var store = pion.databases.config_store;
			var config = {};
			var attributes = store.getAttributes(item);
			for (var i = 0; i < attributes.length; ++i) {
				if (attributes[i] != 'tagName' && attributes[i] != 'childNodes') {
					config[attributes[i]] = store.getValue(item, attributes[i]).toString();
				}
			}
			console.dir(config);
			this.database_form.setValues(config);

			// The comment field needs to be set separately, because dijit.form.Form.setValues doesn't handle <textarea> elements.
			// It would be great if the comment could be an <input> with dojoType="dijit.form.Textarea", but for some reason, this
			// doesn't work inside a template.  The comment field can't be assigned an id, because that would cause an error if
			// there were multiple databases.  That suggests using a dojoAttachPoint, but that doesn't work.  So, I have to do a query.
			var comment_node = dojo.query('textarea.comment', this.database_form.domNode)[0];
			comment_node.value = config.Comment;

			console.debug('config = ', config);
			this.title = config.Name;
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
			var config = this.database_form.getValues();

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.database_form.domNode)[0];
			config.Comment = comment_node.value;

			var put_data = '<PionConfig><Database>';
			for (var tag in config) {
				if (tag != '@id') {
					console.debug('config[', tag, '] = ', config[tag]);
					put_data += '<' + tag + '>' + config[tag] + '</' + tag + '>';
				}
			}
			put_data += '</Database></PionConfig>';
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
						},
						onError: pion.handleFetchError
					});
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		cancel: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.populateFromConfigItem(this.config_item);
		},
		delete2: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected database is ', this.title);
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
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		},
		database: ''
	}
);
