dojo.provide("pion.widgets.TermSelector");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("pion.widgets.TermSelector",
	[dijit._Widget, dijit._Templated],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/TermSelector.html"),
		_handleAddNewVocabulary: function(e) {
			pion.vocabularies.addNewVocabulary();
		},
		_handleAddNewTerm: function(e) {
			var dialog = new plugins.vocabularies.TermInitDialog({vocabulary: this.vocabulary});
			var _this = this;
			dialog.onNewTermSaved = function(full_id) {
				_this.value = full_id;
				_this.onValueSelected(full_id);
			};

			// Set the focus to the first input field, with a delay so that it doesn't get overridden.
			setTimeout(function() { dojo.query('input', dialog.domNode)[0].select(); }, 500);

			dialog.show();
		},
		_handleSelectTerm: function(e) {
			this.value = this.term_select.value;
			this.onValueSelected(this.value);
		},
		_setValueAttr: function(value){
			// Hook to make attr("value", ...) work.
			if (! this.value || value != this.value) {
				this.value = value;
				this.onChange(this.value);
			}
		},
		_setText: function(node, text){
			while(node.firstChild){
				node.removeChild(node.firstChild);
			}
			node.appendChild(dojo.doc.createTextNode(text));
		},
		postCreate: function(){
			this.inherited(arguments);
			this.value = null;
			this.attr('value', '');
			var _this = this;
			pion.vocabularies.vocabularies_by_id = {};
			pion.vocabularies.config_store.fetch({
				onItem: function(item) {
					var id = pion.vocabularies.config_store.getValue(item, '@id');
					if (dojo.isIE) {
						_this.vocab_select.add(new Option(id, id));
					} else {
						_this.vocab_select.add(new Option(id, id), null);
					}
					pion.vocabularies.vocabularies_by_id[id] = new plugins.vocabularies.Vocabulary({'@id': id});
				},
				onError: pion.handleFetchError
			});

			this.vocab_select.onchange = function(e) {
				var id = _this.vocab_select.value;
				_this.vocabulary = pion.vocabularies.vocabularies_by_id[id];
				var h = dojo.connect(_this.vocabulary, 'onDoneLoadingTerms', function() {
					dojo.disconnect(h);
					_this.add_new_term_button.disabled = _this.vocabulary.config.Locked;
					if (_this.vocabulary.config.Locked)
						dojo.addClass(_this.add_new_term_button, 'disabled');
					else
						dojo.removeClass(_this.add_new_term_button, 'disabled');

					var label = _this.vocabulary.config.Locked? id + ' (L)' : id;
					_this.vocab_select.options[_this.vocab_select.selectedIndex].text = label;

					_this.term_select.options.length = 0;
					_this.term_comments_by_id = {};
					_this.vocabulary.vocab_term_store.fetch({
						onItem: function(item) {
							var id = _this.vocabulary.vocab_term_store.getValue(item, 'ID');
							var full_id = _this.vocabulary.vocab_term_store.getValue(item, 'full_id');
							_this.term_comments_by_id[full_id] = _this.vocabulary.vocab_term_store.getValue(item, 'Comment');
							if (dojo.isIE) {
								_this.term_select.add(new Option(id, full_id));
							} else {
								_this.term_select.add(new Option(id, full_id), null);
							}
						},
						onError: pion.handleFetchError
					});
				});
				_this.vocabulary.populateFromServerVocabStore();

				_this.select_term_button.disabled = true;
				dojo.addClass(_this.select_term_button, 'disabled');
			};
			this.term_select.onchange = function(e) {
				_this.select_term_button.disabled = false;
				dojo.removeClass(_this.select_term_button, 'disabled');
				_this.term_comment.value = _this.term_comments_by_id[_this.term_select.value];
			};
		},
		onValueSelected: function(value){
		},
		onChange: function(value){
		}
	}
);
