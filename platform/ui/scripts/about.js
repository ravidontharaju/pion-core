dojo.provide("pion.about");
dojo.require("dijit.Dialog");
dojo.require("dojox.xml.parser");

pion.about.ops_temporarily_suppressed = false;

dojo.declare("pion.about.LicenseKeyDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "../resources/aboutDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
			var _this = this;
			dojo.xhrGet({
				url: '/config',
				preventCache: true,
				handleAs: 'xml',
				timeout: 5000,
				load: function(response, ioArgs) {
					if (dojo.isIE) {
						var pion_version = response.getElementsByTagName('Version')[0].childNodes[0].nodeValue;
					} else {
						var pion_version = response.getElementsByTagName('Version')[0].textContent;
					}
					var pion_edition = "Unknown";
					dojo.xhrGet({
						url: '/key/status',
						preventCache: true,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							pion.key_service_running = true;
							if (dojo.isIE) {
								var key_status = response.getElementsByTagName('Status')[0].childNodes[0].nodeValue;
							} else {
								var key_status = response.getElementsByTagName('Status')[0].textContent;
							}
							pion_edition = "Enterprise";
							_this.doLicenseStuff(pion_version, pion_edition, key_status);
							return response;
						},
						error: function(response, ioArgs) {
							if (ioArgs.xhr.status == 404) {
								pion_edition = "Community";
								_this.doLicenseStuff(pion_version, pion_edition, '404');
							}
							return response;
						}
					});
					return response;
				}
			});

			this.connect(this, "hide", function() {
				this.destroyRecursive(false);
				if (_this.always_callback) {
					_this.always_callback();
				}
				if (pion.about.ops_temporarily_suppressed) {
					// turn ops back on
					var ops_toggle_button = dijit.byId('ops_toggle_button');
					ops_toggle_button.attr('checked', false);
					pion.about.ops_temporarily_suppressed = false;
				}
			});
		},
		submitKey: function(e) {
			//var key = dojo.byId('license_key').value;
			var key = this.license_key.value;
			console.debug('key = ', key);

			var _this = this;
			dojo.rawXhrPut({
				url: '/key',
				contentType: "text/plain",
				handleAs: "text",
				putData: key,
				load: function(response){
					console.debug('response: ', response);
					_this.hide();
					pion.about.doDialog({always_callback: _this.success_callback});
					return response;
				},
				error: function(response, ioArgs) {
					console.debug(ioArgs);
					_this.result_of_submitting_key.innerHTML = 'Error: Key not accepted.';
					return response;
				}
			});
		},
		doLicenseStuff: function(pion_version, pion_edition, key_status) {

			///// FOR TESTING!
			//key_status = "invalid";
			//key_status = "empty";

			console.debug('pion_version = ', pion_version, ', pion_edition = ', pion_edition, ', key_status = ', key_status);

			// build and set "full edition" string
			full_edition_str = "Pion " + pion_edition + " Edition";

			// build and set "full version" (edition + version) string
			full_version_str = full_edition_str + " v" + pion_version;
			this.full_version.innerHTML = full_version_str;
			
			// set license section content based upon edition
			if (pion_edition == "Community") {
				this.community_license.style.display = "block";
			} else {
				if (key_status == "valid") {
					var _this = this;
					dojo.xhrGet({
						url: '/key',
						preventCache: true,
						handleAs: 'xml',
						timeout: 5000,
						load: function(response, ioArgs) {
							if (dojo.isIE) {
								var license_name = response.getElementsByTagName('Name')[0].xml;
								var license_email = response.getElementsByTagName('Email')[0].xml;
								var version_tags = response.getElementsByTagName('Version');
								var license_version = version_tags.length > 0? version_tags[0].xml : "";
								var expiration_tags = response.getElementsByTagName('Expiration');
								var license_expiration = expiration_tags.length > 0? expiration_tags[0].xml : "";
							} else {
								var license_name = response.getElementsByTagName('Name')[0].textContent;
								var license_email = response.getElementsByTagName('Email')[0].textContent;
								var version_tags = response.getElementsByTagName('Version');
								var license_version = version_tags.length > 0? version_tags[0].textContent : "";
								var expiration_tags = response.getElementsByTagName('Expiration');
								var license_expiration = expiration_tags.length > 0? expiration_tags[0].textContent : "";
							}

							// update license information in table
							_this.license_name.innerHTML = license_name;
							_this.license_email.innerHTML = license_email;
							if (license_version == "") {
								_this.license_version.innerHTML = "All versions";
							} else {
								_this.license_version.innerHTML = license_version;
							}
							if (license_expiration == "") {
								_this.license_expiration.innerHTML = "None";
							} else {
								_this.license_expiration.innerHTML = license_expiration;
							}

							// show enterprise license block
							_this.enterprise_licensed.style.display = 'block';

							return response;
						},
						error: pion.handleXhrGetError
					});
				} else {

					// set reason a new license is needed
					if (key_status == "invalid") {
						this.reason_needs_license.innerHTML = "Invalid license key (may have expired).";
					} else {
						this.reason_needs_license.innerHTML = "No license key found.";
					}

					// show enterprise license block
					this.enterprise_not_licensed.style.display = 'block';
				}		
			}
		}
	}
);

pion.about.doDialog = function(kw_args) {
	var ops_toggle_button = dijit.byId('ops_toggle_button');
	if (!ops_toggle_button.checked) {
		ops_toggle_button.attr('checked', true);
		pion.about.ops_temporarily_suppressed = true;
	}
	var dialog = new pion.about.LicenseKeyDialog(kw_args);
	dialog.show();
};

pion.about.checkKeyStatus = function(kw_args) {
	dojo.xhrGet({
		url: '/key/status',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			pion.key_service_running = true;
			if (dojo.isIE) {
				var key_status = response.getElementsByTagName('Status')[0].childNodes[0].nodeValue;
			} else {
				var key_status = response.getElementsByTagName('Status')[0].textContent;
			}
			if (key_status == 'valid') {
				if (kw_args.always_callback) {
					kw_args.always_callback();
				}
				if (kw_args.success_callback) {
					kw_args.success_callback();
				}
			} else {
				// KeyService is running, but no valid key is present, so display the license key dialog.
				pion.about.doDialog(kw_args);
			}
			return response;
		},
		error: function(response, ioArgs) {
			if (ioArgs.xhr.status == 401) {
				if (!dojo.cookie("logged_in")) {
					location.replace('login.html'); // exit and go to main login page
				}
				pion.login.doLoginDialog({
					success_callback: function() {
						pion.about.doDialog(kw_args);
					},
					suppress_default_key_status_check: true
				});
			} else if (ioArgs.xhr.status == 404) {
				// status = 404 (Not Found) => KeyService not running
				// This is expected for Pion Community Edition, and no further action or notification wrt license keys is needed.
				// If kw_args.success_callback is defined, it will not be called, and even if the user somehow succeeds in
				// sending a request to do something that requires a license key, they will get an error from the server.
				pion.key_service_running = false;
				if (kw_args.always_callback) {
					kw_args.always_callback();
				}
			} else {
				pion.about.doDialog(kw_args);
			}
			return response;
		}
	});
}

pion.about.checkKeyStatusDfd = function() {
	var dfd = new dojo.Deferred();
	dojo.xhrGet({
		url: '/key/status',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			pion.key_service_running = true;
			var key_status_node = response.getElementsByTagName('Status')[0];
			var key_status = dojo.isIE? key_status_node.childNodes[0].nodeValue : key_status_node.textContent;
			var products = dojo.map(response.getElementsByTagName('Product'), function(p) { return dojox.xml.parser.textContent(p) });
			if (dojo.indexOf(products, 'Pion Replay') != -1) {
				dfd.callback('replay');
			} else if (dojo.indexOf(products, 'Pion Enterprise') != -1) {
				dfd.callback('enterprise');
			} else {
				dfd.callback('none');
			}
			return response;
		},
		error: function(response, ioArgs) {
			if (ioArgs.xhr.status == 404) {
				pion.key_service_running = false;
				dfd.callback('none');
			} else if (ioArgs.xhr.status == 401) {
				dfd.errback(new Error('Not logged in.'));
			} else {
				dfd.errback(new Error('Key Service error: ioArgs.xhr.status = ' + ioArgs.xhr.status));
			}
			return response;
		}
	});
	return dfd;
}
