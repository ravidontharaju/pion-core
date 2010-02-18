dojo.provide("pion.widgets.KeyStoreEditor");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.data.XmlStore");

dojo.declare("pion.widgets.KeyStoreEditor",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/KeyStoreEditor.html"),
		_handleAddNewKey: function(e) {
			var post_data = '<PionConfig><Key>';
			post_data += pion.makeXmlLeafElement('Name', this.name_widget.value);
			post_data += pion.makeXmlLeafElement('Password', this.password_widget.value);
			post_data += pion.makeXmlLeafElement('PEM', this.pem.value);
			post_data += '</Key></PionConfig>';
			var _this = this;
			dojo.rawXhrPost({
				url: '/keystore',
				contentType: "text/xml",
				handleAs: "xml",
				postData: post_data,
				load: function(response) {
					_this.updateKeyChoices('');
					_this.name_widget.value = '';
					_this.password_widget.value = '';
					_this.pem.value = '';
					_this.save_key_button.disabled = true;
					dojo.addClass(_this.save_key_button, 'disabled');
					return response;
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
			});
		},
		_deleteKey: function() {
			var _this = this;
			dojo.xhrDelete({
				url: '/keystore/' + this.key_select.value,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					_this.updateKeyChoices('');
					return response;
				},
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		//// See comments in onChange(), below, and pion.widgets._TermTextBox._open().
		//_setValueAttr: function(value){
		//	// Hook to make attr("value", ...) work.
		//	if (! this.value || value != this.value) {
		//		this.value = value;
		//		this.onChange(this.value);
		//	}
		//},
		_setText: function(node, text){
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
			node.appendChild(dojo.doc.createTextNode(text));
		},
		postCreate: function() {
			this.inherited(arguments);
			var _this = this;
			var initial_key_id = this.initial_key? this.initial_key : '';
			this.updateKeyChoices(initial_key_id);
			this.key_select.onchange = function() {
				_this.delete_key_button.disabled = false;
				dojo.removeClass(_this.delete_key_button, 'disabled');
			};
		},
		enableSave: function() {
			this.save_key_button.disabled = false;
			dojo.removeClass(this.save_key_button, 'disabled');
		},
		updateKeyChoices: function(initial_key_id) {
			var index = 0;
			var index_of_initial_key = 0;
			this.key_select.options.length = 0;
			var _this = this;
			pion.widgets.key_store.fetch({
				sort: [{attribute: '@id'}],
				onItem: function(item) {
					var id = pion.widgets.key_store.getValue(item, '@id');
					if (id == initial_key_id)
						index_of_initial_key = index;
					var key_name = pion.widgets.key_store.getValue(item, 'Name');
					if (dojo.isIE) {
						_this.key_select.add(new Option(key_name, id));
					} else {
						_this.key_select.add(new Option(key_name, id), null);
					}
					++index;
				},
				onComplete: function() {
					_this.key_select.focus();
					_this.key_select.selectedIndex = index_of_initial_key;
					_this.key_select.onchange();
				},
				onError: pion.handleFetchError
			});
		},
		onChange: function(value) {
			// Could refactor some of the code from postCreate() to here, if there's a reason to use _setValueAttr().
			// See comments in pion.widgets._TermTextBox._open().
		}
	}
);

pion.widgets.key_store = new dojox.data.XmlStore({url: '/keystore', rootItem: 'Key', attributeMap: {'Key.id': '@id'}});
