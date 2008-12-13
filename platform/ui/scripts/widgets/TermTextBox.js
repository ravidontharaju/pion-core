dojo.provide("pion.widgets.TermTextBox");
dojo.require("pion.widgets.TermSelector");
dojo.require("dojox.grid.cells.dijit");

dojo.declare("pion.widgets._TermTextBox",
	dijit.form.TextBox,
	{
		popupClass: "", // default is no popup = text only
		postMixInProperties: function() {
			this.inherited(arguments);
			if (!this.value || this.value.toString() == '') {
				this.value = null;
			}
		},
		_onFocus: function(/*Event*/ evt) {
			// summary: open the TimePicker popup
			this._open();
		},
		_setValueAttr: function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue) {
			this.inherited(arguments);
			if (this._picker) {
				if (! value) { value = ''; }
				this._picker.attr('value', value);
			}
		},
		_open: function() {
			if (this.disabled || this.readOnly || !this.popupClass) {return;}
			var textBox = this;
			if (!this._picker) {
				var PopupProto = dojo.getObject(this.popupClass, false);
				this._picker = new PopupProto({
					onValueSelected: function(value) {
						if (textBox._tabbingAway) {
							delete textBox._tabbingAway;
						} else{
							textBox.focus(); // focus the textbox before the popup closes to avoid reopening the popup
						}
						setTimeout(dojo.hitch(textBox, "_close"), 1); // allow focus time to take

						// this will cause InlineEditBox and other handlers to do stuff so make sure it's last
						pion.widgets._TermTextBox.superclass._setValueAttr.call(textBox, value, true);
					},
					lang: textBox.lang,
					constraints: textBox.constraints
				});
				this._picker.attr('value', this.attr('value') || '');
			}
			if (!this._opened) {
				dijit.popup.open({
					parent: this,
					popup: this._picker,
					around: this.domNode,
					onCancel: dojo.hitch(this, this._close),
					onClose: function() { textBox._opened = false; }
				});
				this._opened=true;
			}			
			dojo.marginBox(this._picker.domNode, { w: this.domNode.offsetWidth });
		},
		_close: function() {
			if (this._opened) {
				dijit.popup.close(this._picker);
				this._opened=false;
			}			
		},
		_onBlur: function() {
			// summary: called magically when focus has shifted away from this widget and it's dropdown
			this._close();
			if (this._picker) {
				// teardown so that constraints will be rebuilt next time (redundant reference: #6002)
				this._picker.destroy();
				delete this._picker;
			}
			this.inherited(arguments);
			// don't focus on <input>.  the user has explicitly focused on something else.
		},
		_getDisplayedValueAttr: function() {
			return this.textbox.value;
		},
		_setDisplayedValueAttr: function(/*String*/ value, /*Boolean?*/ priorityChange) {
			this._setValueAttr(this.parse(value, this.constraints), priorityChange, value);
		},
		destroy: function() {
			if (this._picker) {
				this._picker.destroy();
				delete this._picker;
			}
			this.inherited(arguments);
		},
		_onKeyPress: function(/*Event*/e) {
			var p = this._picker, dk = dojo.keys;
			// Handle the key in the picker, if it has a handler.  If the handler
			// returns false, then don't handle any other keys.
			if (p && this._opened && p.handleKey) {
				if (p.handleKey(e) === false) { return; }
			}
			if (this._opened && e.charOrCode == dk.ESCAPE && !e.shiftKey && !e.ctrlKey && !e.altKey) {
				this._close();
				dojo.stopEvent(e);
			} else if (!this._opened && e.charOrCode == dk.DOWN_ARROW) {
				this._open();
				dojo.stopEvent(e);
			} else if (pion.widgets._TermTextBox.superclass._onKeyPress.apply(this, arguments)) {
				if (e.charOrCode === dk.TAB) {
					this._tabbingAway = true;
				} else if (this._opened && (e.keyChar || e.charOrCode === dk.BACKSPACE || e.charOrCode == dk.DELETE)) {
					// Replace the element - but do it after a delay to allow for 
					// filtering to occur
					setTimeout(dojo.hitch(this, function() {
						dijit.placeOnScreenAroundElement(p.domNode.parentNode, this.domNode, {'BL':'TL', 'TL':'BL'}, p.orient ? dojo.hitch(p, "orient") : null);
					}), 1);
				}
			}
		}
	}
);

dojo.declare("pion.widgets.TermTextBox",
	pion.widgets._TermTextBox,
	{
		baseClass: "dijitTextBox",
		popupClass: "pion.widgets.TermSelector"
	}
);

dojo.declare("pion.widgets.TermTextCell",
	dojox.grid.cells._Widget,
	{
		widgetClass: "pion.widgets.TermTextBox",
		getWidgetProps: function(inDatum) {
			return dojo.mixin(this.inherited(arguments), {
				value: inDatum
			});
		}
	}
);
