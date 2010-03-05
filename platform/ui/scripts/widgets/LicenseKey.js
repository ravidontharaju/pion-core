dojo.provide("pion.widgets.LicenseKey");
dojo.require("dijit.Dialog");
dojo.require("dojox.xml.parser");

dojo.declare("pion.widgets.LicenseKeyDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/LicenseKeyDialog.html"),
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
			//dojo.connect(this, "hide", this, "destroyRecursive");
			var _this = this;
			dojo.connect(this, "onCancel", function() {
				if (_this.callback) {
					_this.callback(false)
				}
			});
			if (this.include_license == false) {
				dojo.addClass(this.license_section, 'hidden');
			}
		},
		include_license: true,
		enableSubmit: function() {
			this.apply_button.attr('disabled', false);
		},
		submitKey: function() {
			if (this.include_license) {
				var form_data = this.form.attr('value');
				if (dojo.indexOf(form_data.checkboxes, 'accept') == -1) {
					this.result_of_submitting_key_2.innerHTML = 'You must agree to the license before submitting the key.';
	
					// Return without callback, because dialog will stay open.
					return false;
				}
			}

			var key = this.license_key_text_area.value;
			var _this = this;
			dojo.rawXhrPut({
				url: '/key',
				contentType: "text/plain",
				handleAs: "xml",
				putData: key,
				load: function(response){
					pion.key_service_running = true;
					var products = dojo.map(response.getElementsByTagName('Product'), function(p) { return dojox.xml.parser.textContent(p) });

					if (_this.requested_product) {
						if (dojo.indexOf(products, _this.requested_product) == -1) {
							_this.result_of_submitting_key_2.innerHTML = 'Error: Key not valid for ' + _this.requested_product + '.';

							// Return without callback, because dialog will stay open.
							return response;
						}
					}

					if (dojo.indexOf(products, 'Pion Replay') != -1) {
						pion.updateLicenseState('replay');
					} else if (dojo.indexOf(products, 'Pion Enterprise') != -1) {
						pion.updateLicenseState('enterprise');
					} else {
						pion.updateLicenseState('lite');
					}

					if (_this.callback) {
						_this.callback(true);
					}
					_this.hide();
					return response;
				},
				error: function(response, ioArgs) {
					_this.result_of_submitting_key_2.innerHTML = 'Error: Key not accepted.';

					// Return without callback, because dialog will stay open.
					return response;
				}
			});
		}
	}
);
