dojo.provide("plugins.vocabularies.Vocabulary");
dojo.require("pion.terms");
dojo.require("pion.vocabularies");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojox.grid.cells.dijit");
dojo.require("dojox.dtl.filter.strings");

dojo.declare("plugins.vocabularies.Vocabulary",
	[],
	{
		constructor: function(config, args) {
			this.config = config;
			dojo.mixin(this, args);
			this.url = '/config/vocabularies/' + this.config['@id'];
			this.server_vocab_store = new dojox.data.XmlStore({url: this.url, attributeMap: {'Vocabulary.id': '@id'}});
			this.server_vocab_term_store = new dojox.data.XmlStore({url: this.url, rootItem: 'Term', attributeMap: {'Term.id': '@id'}});
			this.vocab_term_store = new dojo.data.ItemFileWriteStore({
				data: { identifier: 'ID', items: [] }
			});
			this.vocab_term_store._saveCustom = this._getSaveCustomFunction();
		},
		saveChangedTerms: function() {
			var h = dojo.connect(this, 'onSaveComplete', function() {
				dojo.disconnect(h);
				pion.terms.buildMapOfCategoriesByTerm();
			});
			this.vocab_term_store.save({});
		},
		populateFromServerVocabStore: function() {
			var _this = this;
			this.server_vocab_store.fetch({
				query: {'tagName': 'Vocabulary'}, 
				onComplete: function(items, request) {
					// TODO: check that there was exactly one item returned?
					console.debug('server_vocab_store.fetch.onComplete: items.length = ', items.length);
					_this.vocab_item = items[0];
					_this.populateFromServerVocabItem();
				},
				onError: pion.handleFetchError
			});
		},
		populateFromServerVocabItem: function() {
			this.config.Name = this.server_vocab_store.getValue(this.vocab_item, 'Name').toString();
			var comment = this.server_vocab_store.getValue(this.vocab_item, 'Comment');
			if (comment) {
				this.config.Comment = comment.toString();
			}
			var xml_item = this.server_vocab_store.getValue(this.vocab_item, 'Locked');
			this.config.Locked = (typeof xml_item !== "undefined") && xml_item.toString() == 'true';
			console.dir(this.config);

			var store = this.server_vocab_term_store;
			var items = [];
			var _this = this;
			store.fetch({
				onItem: function(item) {
					var vocab_term_item = {
						full_id: store.getValue(item, '@id'),
						ID: store.getValue(item, '@id').split('#')[1]
					};
					var type = store.getValue(item, 'Type');
					vocab_term_item.Type = pion.terms.type_descriptions_by_name[type.toString()];
					vocab_term_item.Format = store.getValue(type, '@format');
					vocab_term_item.Size = store.getValue(type, '@size');
					var comment = store.getValue(item, 'Comment');
					if (comment) {
						vocab_term_item.Comment = comment.toString();
					}
					items.push(vocab_term_item);
				},
				onComplete: function() {
					_this.vocab_term_store = new dojo.data.ItemFileWriteStore({
						data: { identifier: 'ID', items: items }
					});
					_this.vocab_term_store._saveCustom = _this._getSaveCustomFunction();
					_this.onDoneLoadingTerms();
				},
				onError: pion.handleFetchError
			});
		},
		onDoneLoadingTerms: function() {
		},
		_getSaveCustomFunction: function() {
			var _this = this;
			return function(saveCompleteCallback, saveFailedCallback) {
				var store = this;
				var num_requests = 0, num_responses = 0;
				var ID, url;
				for (ID in this._pending._modifiedItems) {
					if (this._pending._newItems[ID] || this._pending._deletedItems[ID])
						continue;
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					this.fetchItemByIdentity({
						identity: ID,
						onItem: function(item) {
							var put_data = '<PionConfig><Term><Type';
							var format = store.getValue(item, 'Format');
							if (format && format != '-') {
								put_data += ' format="' + pion.escapeXml(format) + '"';
							}
							var size = store.getValue(item, 'Size');
							if (size && size != '-') {
								put_data += ' size="' + pion.escapeXml(size) + '"';
							}
							put_data += '>' + pion.terms.types_by_description[store.getValue(item, 'Type')] + '</Type>';
							if (store.getValue(item, 'Comment')) {
								put_data += pion.makeXmlLeafElement('Comment', store.getValue(item, 'Comment'));
							}
							put_data += '</Term></PionConfig>';
							console.debug('put_data = ', put_data);
							num_requests++;
							dojo.rawXhrPut({
								url: url,
								handleAs: 'xml',
								timeout: 5000,
								contentType: "text/xml",
								putData: put_data,
								load: function(response, ioArgs) {
									console.debug('rawXhrPut for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
									if (++num_responses == num_requests)
										_this.onSaveComplete();
									return response;
								},
								error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
							});
						},
						onError: pion.handleFetchError
					});
				}
				for (ID in this._pending._newItems) {
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					var item = this._pending._newItems[ID];
					var post_data = '<PionConfig><Term><Type';
					var format = store.getValue(item, 'Format');
					if (format && format != '-') {
						post_data += ' format="' + pion.escapeXml(format) + '"';
					}
					var size = store.getValue(item, 'Size');
					if (size && size != '-') {
						post_data += ' size="' + pion.escapeXml(size) + '"';
					}
					post_data += '>' + pion.terms.types_by_description[store.getValue(item, 'Type')] + '</Type>';
					if (store.getValue(item, 'Comment')) {
						post_data += pion.makeXmlLeafElement('Comment', store.getValue(item, 'Comment'));
					}
					post_data += '</Term></PionConfig>';
					console.debug('post_data = ', post_data);
					num_requests++;
					dojo.rawXhrPost({
						url: url,
						handleAs: 'xml',
						timeout: 5000,
						contentType: "text/xml",
						postData: post_data,
						load: function(response, ioArgs) {
							console.debug('rawXhrPost for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
							if (++num_responses == num_requests)
								_this.onSaveComplete();
							return response;
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				}
				for (ID in this._pending._deletedItems) {
					url = dojox.dtl.filter.strings.urlencode('/config/terms/' + _this.config['@id'] + '#' + ID);
					console.debug('_saveCustom: url = ', url);
					num_requests++;
					dojo.xhrDelete({
						url: url,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							console.debug('xhrDelete for url = ' + this.url, '; HTTP status code: ', ioArgs.xhr.status);
							if (++num_responses == num_requests)
								_this.onSaveComplete();
							return response;
						},
						error: pion.getXhrErrorHandler(dojo.xhrDelete)
					});
				}

				//TODO: need to keep track of all the responses, and call saveCompleteCallback or saveFailedCallback, as appropriate.
				saveCompleteCallback();
			};
		},
		onSaveComplete: function() {
		}
	}
);

dojo.declare("plugins.vocabularies.VocabularyInitDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("plugins", "vocabularies/VocabularyInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
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
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			this.id_widget.isValid = function() {
				if (! this.validator(this.textbox.value, this.constraints)) {
					this.invalidMessage = "Invalid Term ID";
					return false;
				}

				// TODO: implement isDuplicateTermId().
				/*
				if (pion.vocabularies.isDuplicateTermId(this.textbox.value)) {
					this.invalidMessage = "A Term with this ID already exists";
					return false;
				}
				*/
				return true;
			}
			this.format_widget.isValid = function() {
				if (! this.validator(this.textbox.value, this.constraints)) {
					this.invalidMessage = "Invalid format.";
					return false;
				}
				return true;
			}
			this.size_widget.isValid = function() {
				if (! this.validator(this.textbox.value, this.constraints)) {
					this.invalidMessage = "Must be a positive integer.";
					return false;
				}
				return true;
			}
		},
		_handleTypeChange: function(type) {
			console.debug('_handleTypeChange: type = ', type);
			if (type == 'specific date' || type == 'specific time' || type == 'specific time & date') {
				this.format_widget.attr('disabled', false);
				this.format_widget.setValue('%Y');
				this.format_widget.domNode.style.visibility = 'visible';
			} else {
				this.format_widget.attr('disabled', true);
				this.format_widget.setValue('');
				this.format_widget.domNode.style.visibility = 'hidden';
			}
			if (type == 'fixed-length string') {
				this.size_widget.attr('disabled', false);
				this.size_widget.setValue('1');
				this.size_widget.domNode.style.visibility = 'visible';
			} else {
				this.size_widget.attr('disabled', true);
				this.size_widget.setValue('');
				this.size_widget.domNode.style.visibility = 'hidden';
			}
		},
		execute: function(dialogFields) {
			var item_object = {
				ID: dialogFields['@id'],
				Type: dialogFields.Type,
				Comment: dialogFields.Comment
			};
			item_object.Format = dialogFields.Format? dialogFields.Format : '-';
			item_object.Size = dialogFields.Size? dialogFields.Size : '-';
			this.vocabulary.vocab_term_store.newItem(item_object);
			if (this.pane) {
				this.pane.markAsChanged();
			} else {
				// If no VocabularyPane is associated with this dialog, save the newly added term immediately.
				this.vocabulary.saveChangedTerms();
				if (this.onNewTermSaved)
					this.onNewTermSaved(this.vocabulary.config['@id'] + '#' + item_object.ID);
			}

			// TODO: scroll to the bottom of the grid. 
		}
	}
);

dojo.declare("plugins.vocabularies.VocabularyPane",
	[ dijit.layout.AccordionPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "vocabularies/VocabularyPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
			var _this = this;
			this.vocabulary = new plugins.vocabularies.Vocabulary(this.config);
			this.initGrid();
			dojo.query("input", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
			dojo.query("textarea", this.domNode).forEach(function(n) { dojo.connect(n, 'change', _this, _this.markAsChanged); });
		},
		initGrid: function() {
			var _this = this;
			this.vocab_grid_layout = [{
				defaultCell: { editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: left;' },
				rows: [
					{ field: 'ID', name: 'ID', width: 15, editable: false },
					{ field: 'Type', name: 'Type', width: 15,
						widgetClass: "dijit.form.FilteringSelect", 
						widgetProps: {store: pion.terms.type_store, searchAttr: "description"} },
					{ field: 'Format', name: 'Format', width: 10 },
					{ field: 'Size', name: 'Size', width: 3 },

					// TODO: restore validation
					//{ field: 'Format', name: 'Format', width: 10, styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {} },
					//{ field: 'Size', name: 'Size', width: 3, styles: '', editor: dojox.grid.editors.Dijit, editorClass: "dijit.form.ValidationTextBox", editorProps: {} },

					{ field: 'Comment', name: 'Comment', width: 'auto' },
					{ name: 'Delete', styles: 'align: center;', width: 3, editable: false,
						value: '<button dojoType=dijit.form.Button class="delete_row"><img src="images/icon-delete.png" alt="DELETE" border="0" /></button>'},
				]
			}];
			this.vocab_term_grid = new dojox.grid.DataGrid({
				store: this.vocabulary.vocab_term_store,
				structure: this.vocab_grid_layout,
				singleClickEdit: true,
				autoHeight: true
			}, document.createElement('div'));
			this.vocab_term_grid_node.appendChild(this.vocab_term_grid.domNode);
			this.vocab_term_grid.startup();
			this.vocab_term_grid.connect(this.vocab_term_grid, 'onCellClick', function(e) {
				if (_this.vocabulary.config.Locked) {
					return;
				}
				if (e.cell.name == 'Delete') {
					this.store.deleteItem(this.getItem(e.rowIndex));
					dojo.addClass(_this.domNode, 'unsaved_changes');

				// TODO: restore validation.
				//} else if (e.cell.field == 'Format' || e.cell.field == 'Size') {
				//	console.debug('e.cell.editorProps.regExp = ', e.cell.editorProps.regExp);
				//	if (e.cell.editor.editor) console.debug('e.cell.editor.editor.regExp = ', e.cell.editor.editor.regExp);
				//	var type = this.vocab_grid.model.getDatum(e.rowIndex, 1);
				//	var regExp = '-';
				//	if (e.cell.field == 'Format') {
				//		if (type == 'specific date' || type == 'specific time' || type == 'specific time & date') {
				//			regExp = '.*%.*';
				//		}
				//	}
				//	if (e.cell.field == 'Size') {
				//		if (type == 'fixed-length string') {
				//			regExp = '[1-9][0-9]*';
				//		}
				//	}
				//	if (e.cell.editor.editor) {
				//		console.debug("e.cell.editor.editor.regExp set to ", regExp);
				//		e.cell.editor.editor.regExp = regExp;
				//	} else {
				//		console.debug("e.cell.editorProps.regExp set to ", regExp);
				//		e.cell.editorProps.regExp = regExp;
				//	}

				}
			});
			dojo.connect(this.vocab_term_grid, 'onApplyCellEdit', this, _this.markAsChanged);
			//dojo.connect(this.vocab_term_grid, 'onRowClick', function(e){console.debug('***** onRowClick: e = ', e)});
			//dojo.connect(this.vocab_term_grid, 'onCellFocus', function(e){console.debug('***** onCellFocus: e.index = ', e.index, ', e.fieldIndex = ', e.fieldIndex, ', e = ', e)});
			//dojo.connect(this.vocab_term_grid, 'onStartEdit', function(inCell, inRowIndex){console.debug('***** onStartEdit: inCell = ', inCell, ', inRowIndex = ', inRowIndex)});
			this.vocab_term_grid.canEdit = function(cell, row_index) {
				if (_this.vocabulary.config.Locked) {
					return false;
				} else {
					switch (cell.field) {
						// Disable editing of 'Format' cell if the type in the 'Type' cell doesn't take a format.
						case 'Format':
							var item = this.getItem(row_index);
							var type = this.store.getValue(item, 'Type').toString();
							return (type == 'specific date' || type == 'specific time' || type == 'specific time & date');

						// Disable editing of 'Size' cell if the type in the 'Type' cell isn't 'fixed-length string'.
						case 'Size':
							var item = this.getItem(row_index);
							var type = this.store.getValue(item, 'Type').toString();
							return (type == 'fixed-length string');

						default:
							return true;
					}
				}
			}
		},
		populateFromServerVocabStore: function() {
			var _this = this;
			var h = dojo.connect(this.vocabulary, 'onDoneLoadingTerms', function() {
				dojo.disconnect(h);
				_this.name.attr('readOnly', _this.vocabulary.config.Locked);
				_this.comment.disabled = _this.vocabulary.config.Locked;
				_this.add_new_term_button.attr('disabled', _this.vocabulary.config.Locked);
				var delete_column_index = _this.vocab_term_grid.layout.cellCount - 1;
				_this.vocab_term_grid.layout.setColumnVisibility(delete_column_index, ! _this.vocabulary.config.Locked);
				var form_data = dojo.clone(_this.vocabulary.config); 
				form_data.checkboxes = _this.vocabulary.config.Locked? ["locked"] : [];
				_this.form.attr('value', form_data);
	
				// See comments in plugins.databases.DatabasePane.populateFromConfigItem.
				var comment_node = dojo.query('textarea.comment', _this.form.domNode)[0];
				comment_node.value = _this.vocabulary.config.Comment? _this.vocabulary.config.Comment : '';
	
				_this.title = _this.vocabulary.config.Name;
				var title_node = dojo.query('.dijitAccordionTitle .dijitAccordionText', _this.domNode)[0];
				title_node.firstChild.nodeValue = _this.title;

				_this.vocab_term_grid.setStore(_this.vocabulary.vocab_term_store);

				// Wait a bit for change events on widgets to get handled.
				var node = _this.domNode;
				setTimeout(function() { dojo.removeClass(node, 'unsaved_changes'); }, 500);
			});
			this.vocabulary.populateFromServerVocabStore();
		},
		_handleAddNewTerm: function() {
			console.debug('_handleAddNewTerm');
			var dialog = new plugins.vocabularies.TermInitDialog({vocabulary: this.vocabulary, pane: pion.vocabularies.selected_pane});
			dialog.save_button.onClick = function() { return dialog.isValid(); };

			// Set the focus to the first input field, with a delay so that it doesn't get overridden.
			setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

			dialog.show();
		},
		save: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.saveVocabConfig();
			this.vocabulary.saveChangedTerms();
		},
		saveVocabConfig: function() {
			var _this = this;
			var form_data = this.form.attr('value');
			this.vocabulary.config.Name = form_data.Name;
			this.vocabulary.config.Locked = dojo.indexOf(form_data.checkboxes, 'locked') >= 0;

			// see comment in populateFromConfigItem about comment field
			var comment_node = dojo.query('textarea.comment', this.form.domNode)[0];
			this.vocabulary.config.Comment = comment_node.value;

			var put_data = '<PionConfig><Vocabulary>';
			for (var tag in this.vocabulary.config) {
				if (tag != '@id') {
					//console.debug('this.vocabulary.config[', tag, '] = ', this.vocabulary.config[tag]);
					put_data += pion.makeXmlLeafElement(tag, this.vocabulary.config[tag]);
				}
			}
			put_data += '</Vocabulary></PionConfig>';
			console.debug('put_data: ', put_data);
			_this = this;
			dojo.rawXhrPut({
				url: '/config/vocabularies/' + this.vocabulary.config['@id'],
				contentType: "text/xml",
				handleAs: "xml",
				putData: put_data,
				load: function(response){
					console.debug('response: ', response);

					// Yes, this is redundant, but unfortunately, 'response' is not an item, as needed by populateFromServerVocabItem.
					_this.populateFromServerVocabStore();
				},
				error: pion.getXhrErrorHandler(dojo.rawXhrPut, {putData: put_data})
			});
		},
		cancel: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			this.vocabulary.vocab_term_store.revert();
			this.populateFromServerVocabStore();
		},
		delete2: function() {
			dojo.removeClass(this.domNode, 'unsaved_changes');
			console.debug('delete2: selected vocabulary is ', this.title);
			_this = this;
			dojo.xhrDelete({
				url: '/config/vocabularies/' + this.vocabulary.config['@id'],
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
				error: pion.getXhrErrorHandler(dojo.xhrDelete)
			});
		},
		markAsChanged: function() {
			console.debug('markAsChanged');
			dojo.addClass(this.domNode, 'unsaved_changes');
		}
	}
);
