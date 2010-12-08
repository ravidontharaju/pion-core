dojo.provide("pion.widgets.ConfigAccordion");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.requireLocalization("pion", "general");

dojo.declare("pion.widgets.ConfigAccordion",
	[ dijit.layout.AccordionContainer ],
	{
		widgetsInTemplate: true,
		createNewPaneFromItem: function(item, store) {
			// We're doing lazy loading of configuration panes.  Here we create a placeholder pane,
			// which will be replaced with a real one if and when it's selected.
			var title_attribute = this.title_attribute || 'Name';
			var title = pion.escapeXml(store.getValue(item, title_attribute));
			var pane = new dijit.layout.ContentPane({title: title, content: 'loading...'});
			pane.config_item = item;
			pane.uuid = store.getValue(item, '@id');
			this.addChild(pane);
			return pane;
		},
		createPanesFromAllItems: function(items, store) {
			for (var i = 0; i < items.length; ++i) {
				this.createNewPaneFromItem(items[i], store);
			}

			// Get the placeholder pane from index.html.
			var first_pane = this.getChildren()[0];

			// Remove it, causing the first remaining child to be selected.
			this.removeChild(first_pane);
	
			// This is needed to get the initial width right on FF3.
			// (More specifically, to avoid a vertical white stripe on the right side of the pane.)
			var _this = this;
			var orig_borderBox = this._borderBox;
			function resizeAfterBorderBoxChanges() {
				if (_this._borderBox == orig_borderBox) {
					setTimeout(resizeAfterBorderBoxChanges, 1000);
				} else {
					_this.resize({h: _this._borderBox.h});
				}
			}
			resizeAfterBorderBoxChanges();
		}
	}
);

dojo.declare("pion.widgets.ConfigAccordionPluginType",
	[dijit._Widget, dijit._Templated],
	{
		plugin_type: '???',
		help_label: '',
		templateString:
			'<div class="plugin_type">' +
				'<input dojoType="dijit.form.TextBox" name="Plugin" disabled="true" />' + 
				'<a class="help" href="http://pion.org/plugins/${plugin_type}" target="_blank">${help_label}</a>' +
			'</div>',
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			dojo.mixin(this, dojo.i18n.getLocalization("pion", "general"));
			if (this.help_label.length == 0)
				this.help_label = this.default_small_help_label;
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);
