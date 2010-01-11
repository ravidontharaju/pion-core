dojo.provide("pion.widgets.SimpleSelect");

dojo.require("dijit.form._FormWidget");

dojo.declare("pion.widgets.SimpleSelect", dijit.form._FormWidget, {
	// summary: Wrapper for a native select element to
	//		interact with dijit.form.Form

	templateString: "<select name='${name}' dojoAttachPoint='containerNode,focusNode' dojoAttachEvent='onchange: _onChange'></select>",

	store: null,

	query: {},

	keyAttr: "",

	// TODO: should this be replaced with 'labelAttr'?  (Note that this would involve replacing it in dozens of places.)
	// 'searchAttr' is a carry over from FilteringSelect, whereas 'labelAttr' seems more correct for SimpleSelect.
	// It's not an utter misnomer, though, since some searching does occur: typing a letter jumps to the next matching label.
	searchAttr: "",

	doneAddingOptions: false,

	attributeMap: dojo.mixin(dojo.clone(dijit.form._FormWidget.prototype.attributeMap),
		{size: "focusNode"}),

	reset: function(){
		// TODO: once we inherit from FormValueWidget this won't be needed
		this._hasBeenBlurred = false;
		this._setValueAttr(this._resetValue, true);
	},

	_getValueAttr: function(){
		// summary:
		//		Hook so attr('value') works.
		return this.containerNode.value;
	},

	_setValueAttr: function(value){
		// summary:
		//		Hook so attr('value', value) works.
		if (this.doneAddingOptions) {
			if (value === null) {
				this.containerNode.selectedIndex = -1;
			} else {
				this.containerNode.value = value;
				if (this.containerNode.value != value) {
					if (dojo.some(this.containerNode.options, function(opt) { return opt.value == value; })) {
						this.onError(new Error("SimpleSelect error: value could not be set to '" + value + "'."));
					} else {
						this.onError(new Error("SimpleSelect error: '" + value + "' is not one of the current options."));
					}
					return;
				}
			}
			this._handleOnChange(value, true);
		} else {
			var h = this.connect(this, '_onDoneAddingOptions', function() {
				this.disconnect(h);
				if (value === null) {
					this.containerNode.selectedIndex = -1;
				} else {
					this.containerNode.value = value;
					if (this.containerNode.value != value) {
						if (dojo.some(this.containerNode.options, function(opt) { return opt.value == value; })) {
							this.onError(new Error("SimpleSelect error: value could not be set to '" + value + "'."));
						} else {
							this.onError(new Error("SimpleSelect error: '" + value + "' is not one of the current options."));
						}
						return;
					}
				}
				this._handleOnChange(value, true);
			});
		}
	},

	deferredSet: function(v) {
		var dfd = new dojo.Deferred();
		this.focus();

		//if (this.attr('value') == v) {
		if (this._lastValueReported == v) {
			dfd.callback(v);
			return dfd;
		}
		//TODO: replace the two connects below with this:
		/*
		var h = dojo.connect(this, 'readyForCallback', function(e, is_error) {
console.info("~~~~~~~~~~~~~~~~~~~~~ In readyForCallback() callback, e = ", e, ", is_error = ", is_error);
			dojo.disconnect(h);
			if (is_error)
				dfd.errback(e);
			else
				dfd.callback(e);
		});
		*/
		var h1 = dojo.connect(this, 'onChangeDone', function(e) {
			dojo.disconnect(h1);
			dojo.disconnect(h2);
			dfd.callback(e);
		});
		var h2 = dojo.connect(this, 'onError', function(e) {
			dojo.disconnect(h1);
			dojo.disconnect(h2);
			dfd.errback(e);
		});

		this.attr('value', v);
		return dfd;
	},

	onChangeDone: function(/*Event*/ e){
		//readyForCallback(e, false);
	},

	onError: function(/*Error*/ e){
		//readyForCallback(e, true);
	},

	_onChange: function(/*Event*/ e){
		this._handleOnChange(this.attr('value'), true);
	},

	// for layout widgets:
	resize: function(/* Object */size){
		if(size){
			dojo.marginBox(this.domNode, size);
		}
	},

	setQuery: function(query) {
		this.query = query;
		this.makeOptionList();
	},

	makeOptionList: function() {
		this.doneAddingOptions = false;
		this.containerNode.options.length = 0;
		var _this = this;
		this.first_option = null;
		this.store.fetch({
			query: _this.query, 
			onItem: function(item) {
				var key = _this.keyAttr? _this.store.getValue(item, _this.keyAttr) : _this.store.getIdentity(item);
				var label = _this.searchAttr? _this.store.getValue(item, _this.searchAttr) : key;
				if (dojo.isIE) {
					_this.containerNode.add(new Option(label, key));
				} else {
					_this.containerNode.add(new Option(label, key), null);
				}
				if (_this.first_option == null) {
					_this.first_option = key;
				}
			},
			onComplete: function() {
				_this._onDoneAddingOptions(_this.first_option);
			},
			onError: pion.handleFetchError
		});
	},

	postCreate: function(){
		if (this.store) {
			this.makeOptionList();
		} else {
			// When there's no store, options must be in the markup.
			// Example (from LogCodecPane.html):
			//		<select dojoType="pion.widgets.SimpleSelect" style="width: 95%;" dojoAttachEvent="onChange: markAsChanged" name="@consec_field_delims">
			//			<option value="true">equivalent to single delimiter</option>
			//			<option value="false">indicate empty fields</option>
			//		</select>

			this.doneAddingOptions = true;
			this._onChange();
		}
	},

	_onDoneAddingOptions: function() {
		this.doneAddingOptions = true;
		this._onChange();
	}
});
