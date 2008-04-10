dojo.provide("plugins.vocabularies.Vocabulary");
dojo.require("pion.vocabularies");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojox.dtl.filter.strings");
dojo.require("dojox.dtl.filter.htmlstrings");
dojo.require("dojox.grid.Grid");
dojo.require("dojox.grid.editors");
dojo.require("dojox.grid._data.model");
dojo.require("dojox.grid._data.dijitEditors");

dojo.declare("plugins.vocabularies.Vocabulary",
	[],
	{
		constructor: function(id, args) {
			this.id = id;
			dojo.mixin(this, args);
			plugins.vocabularies.vocabularies_by_id[id] = this;
			var store = pion.vocabularies.plugin_data_store;
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

plugins.vocabularies.vocabularies_by_id = {};

dojo.declare("plugins.vocabularies.VocabularyInitDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "vocabularies/VocabularyInitDialog.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			this.id_widget.isValid = function() {
				if (!this.validator(this.textbox.value, this.constraints)) {
					this.invalidMessage = "Invalid Vocabulary ID";
					return false;
				}
				if (pion.vocabularies.isDuplicateVocabularyId(this.textbox.value)) {
					this.invalidMessage = "A Vocabulary with this ID already exists";
					return false;
				}
				return true;
			}
			this.name_widget.isValid = function() {
				if (pion.vocabularies.isDuplicateVocabularyName(this.textbox.value)) {
					this.invalidMessage = "A Vocabulary with this name already exists";
					return false;
				}
				return true;
			}
		}
	}
);

dojo.declare("plugins.vocabularies.TermInitDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "vocabularies/TermInitDialog.html"),
		widgetsInTemplate: true,
		_handleTypeChange: function(type) {
			console.debug('_handleTypeChange: type = ', type);
			if (type == 'specific date' || type == 'specific time' || type == 'specific time & date') {
				this.format_widget.setAttribute('disabled', false);
				this.format_widget.setValue('%Y');
				this.format_widget.domNode.style.visibility = 'visible';
			} else {
				this.format_widget.setAttribute('disabled', true);
				this.format_widget.setValue('');
				this.format_widget.domNode.style.visibility = 'hidden';
			}
			if (type == 'fixed-length string') {
				this.size_widget.setAttribute('disabled', false);
				this.size_widget.setValue('1');
				this.size_widget.domNode.style.visibility = 'visible';
			} else {
				this.size_widget.setAttribute('disabled', true);
				this.size_widget.setValue('');
				this.size_widget.domNode.style.visibility = 'hidden';
			}
		},
		execute: function(dialogFields) {
			var pane = pion.vocabularies.selected_pane;
			var item_object = {
				ID: dialogFields['@id'],
				Type: dialogFields.Type,
				Comment: dialogFields.Comment
			};
			item_object.Format = dialogFields.Format? dialogFields.Format : '-';
			item_object.Size = dialogFields.Size? dialogFields.Size : '-';
			pane.working_store.newItem(item_object);
			pane.vocab_grid.model.requestRows();
			pane.vocab_grid.update();
			pane.vocab_grid.scrollToRow(pane.vocab_grid.model.getRowCount());
			pane.markAsChanged();
		}
	}
);

dojo.declare("plugins.vocabularies.VocabularyPane",
	[ dijit.layout.AccordionPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "vocabularies/VocabularyPane.html"),
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.delete_col_index = 5;
			var _this = this;
			dojo.connect(this.vocab_grid, 'onCellClick', this, _this._handleCellClick);
			dojo.connect(this.vocab_grid, 'onApplyCellEdit', this, _this.markAsChanged);
			dojo.connect(this.vocab_grid, 'onRowClick', function(e){console.debug('***** onRowClick: e = ', e)});
			dojo.connect(this.vocab_grid, 'onCellFocus', function(e){console.debug('***** onCellFocus: e.index = ', e.index, ', e.fieldIndex = ', e.fieldIndex, ', e = ', e)});
			dojo.connect(this.vocab_grid, 'onStartEdit', function(inCell, inRowIndex){console.debug('***** onStartEdit: inCell = ', inCell, ', inRowIndex = ', inRowIndex)});

			this.url = '/config/vocabularies/' + this.config['@id'];
			console.debug('url = ', this.url);
			this.vocab_store = new dojox.data.XmlStore({url: this.url, attributeMap: {'Vocabulary.id': '@id'}});
			this.vocab_term_store = new dojox.data.XmlStore({url: this.url, rootItem: 'Term', attributeMap: {'Term.id': '@id'}});
			this.vocab_term_store.getIdentity = function(item) {
				console.debug('vocab_term_store.getIdentity');
				return _this.vocab_term_store.getValue(item, '@id');
			}

			// Make a new datastore called working_store with the same items as this.vocab_term_store (i.e. the terms), but
			// formatted so that dojox.grid.data.DojoData can access all the necessary information.
			// TODO: this probably needs to move to populateFromVocabStore, so that when a pane is
			// selected it gets the latest terms from the server.
			this.items = [];
			this.vocab_term_store.fetch({
				onItem: function(item) {
					var new_item = {};
					new_item.ID = _this.vocab_term_store.getValue(item, '@id').split('#')[1];
					var type = _this.vocab_term_store.getValue(item, 'Type');
					new_item.Type = pion.vocabularies.term_type_descriptions_by_name[type.toString()];
					new_item.Format = _this.vocab_term_store.getValue(type, '@format');
					new_item.Size = _this.vocab_term_store.getValue(type, '@size');
					var comment = _this.vocab_term_store.getValue(item, 'Comment');
					if (comment) {
						new_item.Comment = comment.toString();
					}
					//console.debug('new_item = ', new_item);
					_this.items.push(new_item);
				},
				onComplete: function() {
					console.debug(_this.url, ': items = ', _this.items, ', items[0] = ', _this.items[0]);
					_this.working_store = new dojo.data.ItemFileWriteStore({
						data: {
							identifier: "ID",
							items: _this.items
						}
					});
					_this.model = new dojox.grid.data.DojoData(null, null, {store: _this.working_store, query: {Type: '*'}});
					_this.model.requestRows();
					//console.debug(_this.url, ': _this.model.data = ', _this.model.data);

					_this.vocab_grid.setModel(_this.model);
					//console.debug(_this.url, ': _this.vocab_grid.model.data = ', _this.vocab_grid.model.data);
					/*
					function updateStatus(){
						var p = _this.model.store._pending;
						var key, nCnt = 0, mCnt = 0, dCnt = 0;
						for(key in p._newItems){ nCnt++; }
						for(key in p._modifiedItems){ mCnt++; }
						for(key in p._deletedItems){ dCnt++; }
						//dojo.byId("model_status").innerHTML = 'model.store: ' + nCnt + ' newItems, ' + mCnt + ' modifiedItems, ' + dCnt + ' deletedItems';
						console.debug('model.store: ' + nCnt + ' newItems, ' + mCnt + ' modifiedItems, ' + dCnt + ' deletedItems');
					}

					// These will get called by, e.g., dojox.grid.data.Rows.rowChange, via notify.
					_this.vocab_grid.modelRowChange = updateStatus;
					_this.vocab_grid.modelDatumChange = updateStatus;
					*/
					setTimeout(function(){
						_this.vocab_grid.update();
						_this.vocab_grid.resize();
					}, 500);
				}
			});

			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
		},
		populateFromVocabStore: function() {
			var _this = this;
			this.vocab_store.fetch({
				query: {'tagName': 'Vocabulary'}, 
				onError: function(errorData, request) {
					console.debug('dojo.data error: errorData = ' + errorData + ', request = ', request);
				},
				onComplete: function (items, request) {
					// TODO: check that there was exactly one item returned?
					console.debug('vocab_store.fetch.onComplete: items.length = ', items.length);
					_this.vocab_item = items[0];
					_this.populateFromVocabItem();
				}
			});
		},
		populateFromVocabItem: function() {
			this.config.Name = this.vocab_store.getValue(this.vocab_item, 'Name').toString();
			var comment = this.vocab_store.getValue(this.vocab_item, 'Comment');
			if (comment) {
				this.config.Comment = comment.toString();
			}
			var xml_item = this.vocab_store.getValue(this.vocab_item, 'Locked');
			this.config.Locked = (typeof xml_item !== "undefined") && xml_item.toString() == 'true';
			console.dir(this.config);
			
			this.name.setAttribute('disabled', this.config.Locked);
			this.comment.disabled = this.config.Locked;
			this.add_new_term_button.setAttribute('disabled', this.config.Locked);
			if (this.config.Locked) {
				if (!plugins.vocabularies.VocabularyPane.read_only_grid_layout) {
					plugins.vocabularies.initGridLayouts();
				}
				this.vocab_grid.setStructure(plugins.vocabularies.VocabularyPane.read_only_grid_layout);
			} else {
				if (!plugins.vocabularies.VocabularyPane.grid_layout) {
					plugins.vocabularies.initGridLayouts();
				}
				this.vocab_grid.setStructure(plugins.vocabularies.VocabularyPane.grid_layout);
			}
			this.vocab_grid.update();
			var form_data = dojo.clone(this.config); 
			form_data.checkboxes = this.config.Locked? ["locked"] : [];
			this.form.setValues(form_data);

			// See comments in plugins.databases.DatabasePane.populateFromConfigItem.
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			comment_node.value = this.config.Comment? this.config.Comment : '';

			this.title = this.config.Name;
			var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', this.domNode)[0];
			title_node.firstChild.nodeValue = this.title;

			// Wait a bit for change events on widgets to get handled.
			var node = this.domNode;
			setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
		},
		_handleCellClick: function(e) {
			if (this.config.Locked) {
				return;
			}
			console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
			if (e.cellIndex == this.delete_col_index) {
				var row = this.vocab_grid.model.getRow(e.rowIndex);
				console.debug("deleting item ", row.__dojo_data_item);
				this.working_store.deleteItem(row.__dojo_data_item);
				dojo.addClass(this.domNode, 'unsaved_changes');
				console.debug('Removing row ', e.rowIndex); 
				this.vocab_grid.removeSelectedRows();
			}
			if (e.cellIndex == 2 || e.cellIndex == 3) {
				console.debug('e.cell.editorProps.regExp = ', e.cell.editorProps.regExp);
				if (e.cell.editor.editor) console.debug('e.cell.editor.editor.regExp = ', e.cell.editor.editor.regExp);
				var type = this.vocab_grid.model.getDatum(e.rowIndex, 1);
				var regExp = '-';
				if (e.cellIndex == 2) {
					if (type == 'specific date' || type == 'specific time' || type == 'specific time & date') {
						regExp = '.*%.*';
					}
				}
				if (e.cellIndex == 3) {
					if (type == 'fixed-length string') {
						regExp = '[1-9][0-9]*';
					}
				}
				if (e.cell.editor.editor) {
					console.debug("e.cell.editor.editor.regExp set to ", regExp);
					e.cell.editor.editor.regExp = regExp;
				} else {
					console.debug("e.cell.editorProps.regExp set to ", regExp);
					e.cell.editorProps.regExp = regExp;
				}
			}
		},
		_handleAddNewTerm: function() {
			console.debug('_handleAddNewTerm');
			var dialog = new plugins.vocabularies.TermInitDialog();

			// Set the focus to the first input field, with a delay so that it doesn't get overridden.
			setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

			dialog.show();
		},
		_handleLockingChange: function() {
			console.debug('_handleLockingChange');
		},
		save: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.saveVocabConfig();
			this.saveChangedTerms();
		},
		saveVocabConfig: function() {
			var _this = this;
			var form_data = this.form.getValues();
			this.config.Name = form_data.Name;
			this.config.Locked = dojo.indexOf(form_data.checkboxes, 'locked') >= 0;

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			this.config.Comment = comment_node.value;

			var put_data = '<PionConfig><Vocabulary>';
			for (var tag in this.config) {
				if (tag != '@id') {
					//console.debug('this.config[', tag, '] = ', this.config[tag]);
					put_data += '<' + tag + '>' + this.config[tag] + '</' + tag + '>';
				}
			}
			put_data += '</Vocabulary></PionConfig>';
			console.debug('put_data: ', put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/vocabularies/' + this.config['@id'],
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item, as needed by populateFromVocabItem.
					_this.populateFromVocabStore();
				},
				error: function(response, ioArgs) {
					console.dir(ioArgs);
					console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		},
		saveChangedTerms: function() {
			var store = this.working_store;
			var _this = this;
			var ID, url;

			store._saveCustom = function(saveCompleteCallback, saveFailedCallback) {
				for (ID in this._pending._modifiedItems) {
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					this.fetchItemByIdentity({
						identity: ID,
						onItem: function(item) {
							var put_data = '<PionConfig><Term><Type';
							var format = store.getValue(item, 'Format');
							if (format && format != '-') {
								put_data += ' format="' + format + '"';
							}
							var size = store.getValue(item, 'Size');
							if (size && size != '-') {
								put_data += ' size="' + size + '"';
							}
							put_data += '>' + pion.vocabularies.term_types_by_description[store.getValue(item, 'Type')] + '</Type>';
							if (store.getValue(item, 'Comment')) {
								put_data += '<Comment>' + store.getValue(item, 'Comment') + '</Comment>';
							}
							put_data += '</Term></PionConfig>';
							console.debug('put_data = ', put_data);
							dojo.rawXhrPut({
								url: url,
								handleAs: 'xml',
								timeout: 1000,
								contentType: "text/xml",
								putData: put_data,
								load: function(response, ioArgs) {
									console.debug('rawXhrPut for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
									return response;
								},
								error: function(response, ioArgs) {
									console.dir(ioArgs);
									console.error('Error from rawXhrPut to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
									return response;
								}
							});
						}
					});
				}
				for (ID in this._pending._newItems) {
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					var item = this._pending._newItems[ID];
					var post_data = '<PionConfig><Term><Type';
					var format = store.getValue(item, 'Format');
					if (format && format != '-') {
						post_data += ' format="' + format + '"';
					}
					var size = store.getValue(item, 'Size');
					if (size && size != '-') {
						post_data += ' size="' + size + '"';
					}
					post_data += '>' + pion.vocabularies.term_types_by_description[store.getValue(item, 'Type')] + '</Type>';
					if (store.getValue(item, 'Comment')) {
						post_data += '<Comment>' + store.getValue(item, 'Comment') + '</Comment>';
					}
					post_data += '</Term></PionConfig>';
					console.debug('post_data = ', post_data);
					dojo.rawXhrPost({
						url: url,
						handleAs: 'xml',
						timeout: 1000,
						contentType: "text/xml",
						postData: post_data,
						load: function(response, ioArgs) {
							console.debug('rawXhrPost for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
							return response;
						},
						error: function(response, ioArgs) {
							console.dir(ioArgs);
							console.error('Error from rawXhrPost to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
							return response;
						}
					});
				}
				for (ID in this._pending._deletedItems) {
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					dojo.xhrDelete({
						url: url,
						handleAs: 'xml',
						timeout: 1000,
						load: function(response, ioArgs) {
							console.debug('xhrDelete for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
							return response;
						},
						error: function(response, ioArgs) {
							console.error('Error from xhrDelete to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
							return response;
						}
					});
				}
				//TODO: need to keep track of all the responses, and call saveCompleteCallback or saveFailedCallback, as appropriate.
				saveCompleteCallback();
			}
			store.save({});
		},
		cancel: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.working_store.revert();
			this.vocab_grid.model.requestRows();
			this.populateFromVocabStore();
		},
		delete2: function () {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected vocabulary is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/vocabularies/' + this.config['@id'],
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					console.debug('xhrDelete for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);

					// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
					// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
					dijit.byId('vocab_config_accordion').forward();
					
					dijit.byId('vocab_config_accordion').removeChild(_this);
					pion.vocabularies._adjustAccordionSize();
					return response;
				},
				error: function(response, ioArgs) {
					console.error('Error from xhrDelete to ', this.url, '.  HTTP status code: ', ioArgs.xhr.status);
					return response;
				}
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		}
	}
);

plugins.vocabularies.initGridLayouts = function() {
	plugins.vocabularies.VocabularyPane.grid_layout = [{
		rows: [[
			{ name: 'ID',      field: 'ID',      width: 'auto', styles: '' },
			{ name: 'Type',    field: 'Type',    width: 'auto', styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.FilteringSelect", 
																editorProps: {store: pion.vocabularies.term_type_store, searchAttr: "description"} },
			{ name: 'Format',  field: 'Format',  width: 10,     styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {} },
			{ name: 'Size',    field: 'Size',    width: 3,      styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {} },
			{ name: 'Comment', field: 'Comment', width: 'auto', styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.TextBox", editorProps: {} },
			{ name: 'Delete',					 width: 3,      styles: 'align: center;',  
			  value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>' }
		]]
	}];

	plugins.vocabularies.VocabularyPane.read_only_grid_layout = [{
		rows: [[
			{ field: 'ID',      width: 'auto', styles: '' },
			{ field: 'Type',    width: 'auto', styles: '' },
			{ field: 'Format',  width: 10,     styles: '' },
			{ field: 'Size',    width: 3,      styles: '' },
			{ field: 'Comment', width: 'auto', styles: '' }
		]]
	}];
}