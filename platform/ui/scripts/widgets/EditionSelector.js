dojo.provide("pion.widgets.EditionSelector");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Form");
dojo.requireLocalization("pion", "wizard");

dojo.declare("pion.widgets.EditionSelectorForm",
	[ dijit.form.Form ],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/EditionSelector/EditionSelectorForm.html"),
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
			var nlsStrings = dojo.i18n.getLocalization("pion", "wizard");
			dojo.mixin(this, nlsStrings);
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
			dojo.connect(this, "hide", this, "destroyRecursive");
			this.attr('value', {edition: ''});
		},
		coreEditionSelected: function() {
			pion.edition = 'Core';
			dojo.cookie('pion_edition', pion.edition, {expires: 5000}); // 5000 days
			pion.widgets.Wizard.prepareLicensePane();
			pion.wizard.selectChild(dijit.byId('license_acceptance_pane'));
		},
		liteEditionSelected: function() {
			pion.edition = 'Lite';
			dojo.cookie('pion_edition', pion.edition, {expires: 5000}); // 5000 days
			pion.widgets.Wizard.prepareLicensePane();
			pion.wizard.selectChild(dijit.byId('license_acceptance_pane'));
		},
		replayEditionSelected: function() {
			if (! pion.key_service_running) {
				alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
				var form = dijit.byId('select_edition_form');
				form.attr('value', {edition: ''});
				return;
			}

			pion.about.checkKeyStatusDfd()
			.addBoth(function(license_key_type) {
				pion.edition = 'Replay';
				dojo.cookie('pion_edition', 'replay', {expires: 5000}); // 5000 days
				if (license_key_type != 'replay') {
					pion.wizard.selectChild(dijit.byId('license_key_pane'));
				} else {
					pion.widgets.Wizard.prepareLicensePane();
					pion.wizard.selectChild(dijit.byId('license_acceptance_pane'));
				}
			});
		},
		enterpriseEditionSelected: function() {
			if (! pion.key_service_running) {
				alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
				var form = dijit.byId('select_edition_form');
				form.attr('value', {edition: ''});
				return;
			}

			pion.about.checkKeyStatusDfd()
			.addBoth(function(license_key_type) {
				pion.edition = 'Enterprise';
				dojo.cookie('pion_edition', 'enterprise', {expires: 5000}); // 5000 days
				if (license_key_type != 'replay' && license_key_type != 'enterprise') {
					pion.wizard.selectChild(dijit.byId('license_key_pane'));
				} else {
					pion.widgets.Wizard.prepareLicensePane();
					pion.wizard.selectChild(dijit.byId('license_acceptance_pane'));
				}
			});
		}
	}
);

dojo.declare("pion.widgets.EditionSelectorDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/EditionSelector/EditionSelectorDialog.html"),
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
			var nlsStrings = dojo.i18n.getLocalization("pion", "wizard");
			dojo.mixin(this, nlsStrings);
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
//			dojo.connect(this, "hide", this, "destroyRecursive");
			var _this = this;
		},
		handleSelection: function() {
			dojo.cookie('pion_edition', pion.edition, {expires: 5000}); // 5000 days

			dojo.byId('outer').style.visibility = 'visible';
			dojo.byId('current_user_menu_section').style.visibility = 'visible';
			dojo.byId('current_user').innerHTML = dojo.cookie('user');

			// The Reactors tab will now be opened, unless there is a Replay service configured (i.e. in services.xml)
			// and usable (i.e. plugin is found, UI plugin is found, service can be initialized).
			pion.terms.init();
			pion.services.init();

			this.hide();
		},
		coreEditionSelected: function() {
			// TODO: require the user to agree to the GPL Affero license.
			pion.edition = 'Core';
			this.handleSelection();
		},
		liteEditionSelected: function() {
			// TODO: require the user to agree to the Enterprise license.
			pion.edition = 'Lite';
			this.handleSelection();
		},
		enterpriseEditionSelected: function() {
			if (! pion.key_service_running) {
				alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
				return;
			}

			var title = 'Please enter your Pion Enterprise license key';
			var dialog = new pion.widgets.LicenseKeyDialog({title: title, requested_product: 'Pion Enterprise'});
			dialog.show();
			var _this = this;
			dialog.callback = function(key_is_valid_for_requested_product) {
				if (key_is_valid_for_requested_product) {
					pion.edition = 'Enterprise';
					_this.handleSelection();
				}
			}
		},
		replayEditionSelected: function() {
			if (! pion.key_service_running) {
				alert(pion.wizard_nlsStrings.edition_disabled_because_key_service_not_running);
				return;
			}

			var title = 'Please enter your Pion Replay license key';
			var dialog = new pion.widgets.LicenseKeyDialog({title: title, requested_product: 'Pion Replay'});
			dialog.show();
			var _this = this;
			dialog.callback = function(key_is_valid_for_requested_product) {
				if (key_is_valid_for_requested_product) {
					pion.edition = 'Replay';
					_this.handleSelection();
				}
			}
		}
	}
);
