dojo.provide("plugins.databases.Database");
dojo.require("pion.databases");
dojo.require("pion.widgets.SimpleSelect");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("plugins.databases.SelectPluginDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/SelectPluginDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.databases.DatabaseInitDialog",
	[ dijit.Dialog ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/DatabaseInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

dojo.declare("plugins.databases.DatabasePane",
	[ dijit.layout.AccordionPane ], // inherit from this class, which in turn mixes in _Templated and _Layout
	{
		templatePath: dojo.moduleUrl("plugins", "databases/DatabasePane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		getHeight: function() {
			// TODO: What makes sense here as a default?  Should this just throw an exception?
			return 100;
		},
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
			this.database_form.attr('value', config);

			// The comment field needs to be set separately, because dijit.form.attr() doesn't handle <textarea> elements.
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
			var config = this.database_form.attr('value');

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.database_form.domNode)[0];
			config.Comment = comment_node.value;

			this.put_data = '<PionConfig><Database>';
			for (var tag in config) {
				if (tag != '@id') {
					console.debug('config[', tag, '] = ', config[tag]);
					this.put_data += pion.makeXmlLeafElement(tag, config[tag]);
				}
			}
			if (this._insertCustomData) {
				this._insertCustomData();
			}
			this.put_data += '</Database></PionConfig>';
			console.debug('put_data: ', this.put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/databases/' + this.uuid,
				contentType: "text/xml",
				handleAs: "xml",
				putData: this.put_data,
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
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: this.put_data})
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
