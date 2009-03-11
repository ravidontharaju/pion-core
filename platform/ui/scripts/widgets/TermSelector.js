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
		_handleDoubleClick: function(e) {
			this.value = this.term_select.value;
			this.onValueSelected(this.value);
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
		postCreate: function(){
			this.inherited(arguments);
			var _this = this;
			var initial_vocab_id = this.initial_term? this.initial_term.toString().split('#')[0] : '';
			this.category = (this.query && this.query.category)? this.query.category : 'any';
			pion.vocabularies.vocabularies_by_id = {};
			var index = 0;
			var index_of_initial_vocab = 0;
			pion.vocabularies.config_store.fetch({
				onItem: function(item) {
					var id = pion.vocabularies.config_store.getValue(item, '@id');
					if (id == initial_vocab_id)
						index_of_initial_vocab = index;
					var vocab_label = id.split(':')[2];
					if (dojo.isIE) {
						_this.vocab_select.add(new Option(vocab_label, id));
					} else {
						_this.vocab_select.add(new Option(vocab_label, id), null);
					}
					pion.vocabularies.vocabularies_by_id[id] = new plugins.vocabularies.Vocabulary({'@id': id});
					++index;
				},
				onComplete: function() {
					_this.vocab_select.focus();
					_this.vocab_select.selectedIndex = index_of_initial_vocab;
					_this.vocab_select.onchange();
				},
				onError: pion.handleFetchError
			});

			this.vocab_select.onchange = function() {
				var id = _this.vocab_select.value;
				_this.vocabulary = pion.vocabularies.vocabularies_by_id[id];
				var h = dojo.connect(_this.vocabulary, 'onDoneLoadingTerms', function() {
					dojo.disconnect(h);
					_this.add_new_term_button.disabled = _this.vocabulary.config.Locked;
					if (_this.vocabulary.config.Locked)
						dojo.addClass(_this.add_new_term_button, 'disabled');
					else
						dojo.removeClass(_this.add_new_term_button, 'disabled');
					var vocab_label = id.split(':')[2];
					var label = _this.vocabulary.config.Locked? vocab_label + ' (L)' : vocab_label;
					_this.vocab_select.options[_this.vocab_select.selectedIndex].text = label;

					_this.term_select.options.length = 0;
					_this.term_comments_by_id = {};
					var index = 0;
					var index_of_initial_term = 0;
					_this.vocabulary.vocab_term_store.fetch({
						onItem: function(item) {
							var id = _this.vocabulary.vocab_term_store.getValue(item, 'ID');
							var full_id = _this.vocabulary.vocab_term_store.getValue(item, 'full_id');
							if (_this.category == 'any' || _this.category == pion.terms.categories_by_id[full_id]) {
								if (_this.initial_term && _this.initial_term.toString() == full_id)
									index_of_initial_term = index;
								_this.term_comments_by_id[full_id] = _this.vocabulary.vocab_term_store.getValue(item, 'Comment');
								if (dojo.isIE) {
									_this.term_select.add(new Option(id, full_id));
								} else {
									_this.term_select.add(new Option(id, full_id), null);
								}
								++index;
							}
						},
						onComplete: function() {
							_this.term_select.selectedIndex = index_of_initial_term;
							_this.term_select.onchange();
						},
						onError: pion.handleFetchError
					});
				});
				_this.vocabulary.populateFromServerVocabStore();

				_this.select_term_button.disabled = true;
				dojo.addClass(_this.select_term_button, 'disabled');
			};
			this.term_select.onchange = function() {
				_this.select_term_button.disabled = false;
				dojo.removeClass(_this.select_term_button, 'disabled');
				//_this.select_term_button.focus(); // Not good, because term_select loses focus and arrow keys don't work.
				_this.term_comment.value = _this.term_comments_by_id[_this.term_select.value];
			};
			this.connect(this.vocab_select, 'keyup', function(e) {
				//if (e.keyCode == dojo.keys.TAB) { // Not detected for some reason.
				if (e.keyCode == dojo.keys.ENTER) {
					this.term_select.focus();
				}
			});
			this.connect(this.term_select, 'keyup', function(e) {
				if (e.keyCode == dojo.keys.ENTER) {
					this.value = this.term_select.value;
					this.onValueSelected(this.value);
				}
			});
		},
		onChange: function(value) {
			// Could refactor some of the code from postCreate() to here, if there's a reason to use _setValueAttr().
			// See comments in pion.widgets._TermTextBox._open().
		}
	}
);
