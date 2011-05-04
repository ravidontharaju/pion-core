dojo.provide("plugins.protocols.HTTPProtocol");
dojo.require("plugins.protocols.Protocol");

plugins.protocols.HTTPProtocol.label = 'HTTP Protocol';

dojo.declare("plugins.protocols.HTTPProtocolPane",
	[ plugins.protocols.ProtocolPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "protocols/HTTPProtocol/HTTPProtocolPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		populateWithDefaults: function() {
			this.inherited('populateWithDefaults', arguments);
			this.form.attr('value', {MaxRequestContentLength: 1048576, MaxResponseContentLength: 1048576});
		},
		getHeight: function() {
			return this.pane_end.offsetTop;
		},
		_addCustomConfigValues: function(config, item) {
			var store = pion.protocols.config_store;
			config.options = [];

			// By default, RawRequestHeaders and RawResponseHeaders are both false.
			if (store.hasAttribute(item, 'RawRequestHeaders')) {
				if (store.getValue(item, 'RawRequestHeaders').toString() == 'true') {
					config.options.push('RawRequestHeaders');
				}
			}
			if (store.hasAttribute(item, 'RawResponseHeaders')) {
				if (store.getValue(item, 'RawResponseHeaders').toString() == 'true') {
					config.options.push('RawResponseHeaders');
				}
			}

			// By default, AllowUtf8Conversion is true.
			var allow_utf8_conversion = true;
			if (store.hasAttribute(item, 'AllowUtf8Conversion')) {
				allow_utf8_conversion = (store.getValue(item, 'AllowUtf8Conversion').toString() == 'true');
			}
			if (allow_utf8_conversion) {
				config.options.push('AllowUtf8Conversion');
			}
			this.updateDisabling({target: {checked: allow_utf8_conversion}});

			// By default, AllowSearchingContentForCharset is the same as AllowUtf8Conversion.
			var allow_searching_content_for_charset = allow_utf8_conversion;
			if (store.hasAttribute(item, 'AllowSearchingContentForCharset')) {
				allow_searching_content_for_charset = (store.getValue(item, 'AllowSearchingContentForCharset').toString() == 'true');
			}
			if (allow_searching_content_for_charset) {
				config.options.push('AllowSearchingContentForCharset');
			}
		},
		_makeCustomElements: function(config) {
			// If the 'allow searching' checkbox is disabled, temporarily enable it and reread the form values,
			// so that if the box is checked, AllowSearchingContentForCharset will be included in config.options.
			var allow_searching_was_disabled = this.allow_searching.attr('disabled');
			if (allow_searching_was_disabled) {
				this.allow_searching.attr('disabled', false);
				config = this.form.attr('value');
			}

			var put_data = '<RawRequestHeaders>';
			put_data += (dojo.indexOf(config.options, 'RawRequestHeaders') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</RawRequestHeaders><RawResponseHeaders>';
			put_data += (dojo.indexOf(config.options, 'RawResponseHeaders') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</RawResponseHeaders><AllowUtf8Conversion>';
			put_data += (dojo.indexOf(config.options, 'AllowUtf8Conversion') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</AllowUtf8Conversion><AllowSearchingContentForCharset>';
			put_data += (dojo.indexOf(config.options, 'AllowSearchingContentForCharset') != -1); // 'true' iff corresponding checkbox was checked
			put_data += '</AllowSearchingContentForCharset>';

			// Restore original disabled status of 'allow searching' checkbox.
			if (allow_searching_was_disabled) {
				this.allow_searching.attr('disabled', true);
			}

			return put_data;
		},
		updateDisabling: function(e) {
			if (e.target.checked) {
				dojo.removeClass(this.allow_searching_label, 'disabled');
				this.allow_searching.set('disabled', false);
			} else {
				dojo.addClass(this.allow_searching_label, 'disabled');
				this.allow_searching.set('disabled', true);
			}
		}
	}
);
