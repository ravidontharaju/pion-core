dojo.provide("pion.about");
dojo.require("dijit.Dialog");

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

			//dojo.connect(this, "hide", this, "destroyRecursive");
			// The previous line causes the dialog to remain on the screen after the close button is clicked.
			// It doesn't matter whether I connect to hide() or onCancel(), or whether I call destroy() or destroyRecursive().
			// This is a bug in Dojo, which can be demonstrated with the following self-contained file:
/*
<head>
	<style type="text/css">@import "dojo-src/dijit/themes/tundra/tundra.css";</style>
	<script type="text/javascript" src="dojo-src/dojo/dojo.js" djConfig="isDebug: true, parseOnLoad: true"></script>
	<script type="text/javascript">
		dojo.require("dijit.Dialog");
		doDialog = function() {
			var dialog = new dijit.Dialog({title: "test"});
			
			// The following line causes the Dialog to NOT disappear from the screen when the close button is clicked, although it is removed from the registry.
			// If commented out, the Dialog does disappear as expected, but remains in memory (thus resulting in a memory leak).
			dojo.connect(dialog, "hide", dialog, "destroy");
			
			dialog.show();
		};
	</script>
</head>
<body class="tundra">
	<button onclick="doDialog()">make dialog</button>
</body>
</html>
*/
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
					pion.about.doDialog();
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
						error: function() {
console.debug('error from xhrGet');
						}
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

pion.about.doDialog = function() {
	var dialog = new pion.about.LicenseKeyDialog();
	dialog.show();
};
