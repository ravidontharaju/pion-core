dojo.registerModulePath("pion", "/scripts");
dojo.registerModulePath("plugins", "/plugins");
dojo.require("dojo.cookie");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.TextBox");
dojo.require("dojox.dtl.filter.strings");
dojo.require("dojox.widget.Standby");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them
dojo.require("pion._base");
dojo.require("pion.reactors");
dojo.require("pion.vocabularies");
dojo.require("pion.codecs");
dojo.require("pion.databases");
dojo.require("pion.protocols");
dojo.require("pion.users");
dojo.require("pion.system");
dojo.require("pion.login");
dojo.require("pion.terms");
dojo.require("pion.services");
dojo.require("pion.about");
dojo.require("pion.widgets.Wizard");
dojo.require("pion.widgets.LicenseKey");
dojo.require("pion.widgets.EditionSelector");
dojo.requireLocalization("pion", "wizard");
dojo.requireLocalization("pion", "general");

var reactor_config_page_initialized = false;
var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var database_config_page_initialized = false;
var protocol_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var firefox_on_mac;

dojo.declare("pion.DeleteConfirmationDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "../resources/DeleteConfirmationDialog.html"),
		postMixInProperties: function() {
			// See pion.login.LoginDialog for explanation of why this is needed..
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true
	}
);

pion.doDeleteConfirmationDialog = function(message, delete_function, delete_function_arg) {
	var dialog = pion.delete_confirmation_dialog;
	if (!dialog) {
		dialog = new pion.DeleteConfirmationDialog();

		// Save for future use.
		pion.delete_confirmation_dialog = dialog;
	}
	dojo.byId('are_you_sure').innerHTML = message;
	dialog.delete_button.onClick = function() { dialog.onCancel(); delete_function(delete_function_arg); };
	dialog.show();
}

pion.initOptionalValue = function(store, item, new_item_object, tag_name, optional_default) {
	if (store.hasAttribute(item, tag_name)) {
		new_item_object[tag_name] = store.getValue(item, tag_name);
	} else if (optional_default !== undefined) {
		new_item_object[tag_name] = optional_default;
	}
}

// Contains ids of all the children of 'main_stack_container' in index.html.
pion.permission_types_by_tab_id = {
	reactor_config:  'Reactors',
	vocab_config:    'Vocabularies',
	codec_config:    'Codecs',
	database_config: 'Databases',
	protocol_config: 'Protocols',
	user_config:     'Admin',
	system_config:   'Admin'
};

// This is called by pion.services.init()
pion.initTabs = function() {
	var main_stack = dijit.byId('main_stack_container');

	// TODO: it would be a lot nicer to add only the permitted tabs, instead of creating
	// all of them and then deleting the ones not found on the list of permitted tabs.
	if (! ('Admin' in pion.permissions_object)) {
		for (var tab_id in pion.permission_types_by_tab_id) {
			if (! (pion.permission_types_by_tab_id[tab_id] in pion.permissions_object)) {
				main_stack.removeChild(dijit.byId(tab_id));
			}
		}
	}

	init_services_standby.hide();

	var tabs = main_stack.getChildren();
	if (tabs.length > 0) {
		var chooseBestTab = function(tabs, i) {
			var dfd = new dojo.Deferred();

			if (i == tabs.length) // All tabs are empty, so just pick the first one.
				dfd.callback(tabs[0]);

			if ('isEmpty' in tabs[i]) {
				tabs[i].isEmpty().addCallback(function(is_empty) {
					if (is_empty) {
						chooseBestTab(tabs, i + 1).addCallback(function(tab) {
							dfd.callback(tab);
						});
					} else
						dfd.callback(tabs[i]);
				});
			} else
				dfd.callback(tabs[i]);

			return dfd;
		}
		chooseBestTab(tabs, 0).addCallback(function(tab) {
			main_stack.selectChild(tab);
			configPageSelected(tab);
		})
	} else {
		alert('There are no access rights defined for this user account.  You may need to update your users.xml file.');
	}

	// Don't be tempted to move this earlier to avoid calling configPageSelected() above:
	// selectChild(page) won't trigger configPageSelected(page) if page was already selected.
	dojo.subscribe("main_stack_container-selectChild", configPageSelected);

	// Show the wizard link only if the user has 'Admin' permission and KeyService is running.
	// (If there's no KeyService running, then we assume Pion Core is installed, in which case the wizard is not useful.)
	if ('Admin' in pion.permissions_object && pion.key_service_running) {
		dojo.byId('wizard_menu_section').style.visibility = 'visible';
	}
}

// Allowed values of license_state are core, lite, enterprise and replay, but note that it's not 
// necessarily the same as the value in dojo.cookie('pion_edition'), even when that cookie exists.
pion.updateLicenseState = function(license_state) {
	pion.license_state = license_state;
	pion.updateLogo(license_state);
}

pion.updateLogo = function(logo_type) {
	var logo_div = dojo.byId('logo');
	dojo.query('p.logo', logo_div).forEach(function(n) {
		if (dojo.hasClass(n, logo_type))
			dojo.removeClass(n, 'hidden');
		else
			dojo.addClass(n, 'hidden');
	});
}

pion.setup_success_callback = function() {
	pion.terms.init();
	pion.services.init();
}

pion.editionSetup = function(license_key_type) {
	dojo.xhrGet({
		url: '/config/reactors',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			// The user must be logged in since the request succeeded.
			dojo.cookie("logged_in", "true", {expires: 1}); // 1 day
			pion.last_logged_in_user = dojo.cookie('user');

			var reactors = response.getElementsByTagName('Reactor');
			if (! pion.key_service_running) {
				// If there's no KeyService running, then we assume Pion Core is installed, in which case
				// the wizard is not useful, so we go directly to the Reactors tab.

				dojo.byId('outer').style.visibility = 'visible';
				dojo.byId('current_user_menu_section').style.visibility = 'visible';
				dojo.byId('current_user').innerHTML = dojo.cookie('user');
				pion.setup_success_callback();
			} else if (reactors.length > 0 || dojo.cookie('pion_edition')) {
				// The user has gone through the wizard before and/or has a pre-existing configuration.
				// They can still choose to run the wizard from the menu bar link.

				if (license_key_type == 'invalid' && dojo.cookie('pion_edition') != 'Core' && dojo.cookie('pion_edition') != 'Lite') {
					var dialog = new pion.widgets.EditionSelectorDialog;
					dialog.show();
				} else {
					// After pion.initTabs() is called, the Reactors tab will be selected, unless
					// a Replay service is configured, in which case the Replay tab will be selected.
					dojo.byId('outer').style.visibility = 'visible';
					dojo.byId('current_user_menu_section').style.visibility = 'visible';
					dojo.byId('current_user').innerHTML = dojo.cookie('user');
					pion.setup_success_callback();
				}
			} else {
				// KeyService running, no reactors configured and no pion_edition cookie found, so do wizard.

				var wizard = dijit.byId('wizard');
				wizard.start(license_key_type);
			}
		},
		error: function(response, ioArgs) {
			pion.handleXhrGetError();

			// Can't be 401, because the only way to get here is from pion.checkKeyService()
			// and only if the KeyService response was not 401.
			/*
			if (ioArgs.xhr.status == 401) {
				if (!dojo.cookie('logged_in')) {
					location.replace('login.html'); // exit and go to main login page
				}
				pion.login.doLoginDialog({success_callback: pion.editionSetup});
			} else {
				console.error('HTTP status code: ', ioArgs.xhr.status);
			}
			return response;
			*/
		}
	});
}

pion.checkKeyService = function() {
	pion.about.checkKeyStatusDfd()
	.addCallback(function(license_key_type) {
		pion.editionSetup(license_key_type);
	})
}

var init = function() {
	firefox_on_mac = navigator.userAgent.indexOf('Mac') >= 0 && navigator.userAgent.indexOf('Firefox') >= 0;

	pion.checkKeyService();
}

dojo.addOnLoad(init);

function configPageSelected(page) {
	pion.current_page = page;
	if (page.id == 'reactor_config') {
		if (reactor_config_page_initialized) {
			pion.reactors.reselectCurrentWorkspace(); // In case current workspace was created via another page.
			dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});
		} else {
			pion.reactors.init();
			reactor_config_page_initialized = true;
		}
	} else if (page.id == 'vocab_config') {
		if (vocab_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.vocabularies.getHeight()});
		} else {
			pion.vocabularies.init();
			vocab_config_page_initialized = true;
		}
	} else if (page.id == 'codec_config') {
		if (codec_config_page_initialized) {
			pion.codecs._adjustAccordionSize(); // In case Codecs were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.codecs.getHeight()});
		} else {
			pion.codecs.init();
			codec_config_page_initialized = true;
		}
	} else if (page.id == 'database_config') {
		if (database_config_page_initialized) {
			pion.databases._adjustAccordionSize(); // In case Databases were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.databases.getHeight()});
		} else {
			pion.databases.init();
			database_config_page_initialized = true;
		}
	} else if (page.id == 'protocol_config') {
		if (protocol_config_page_initialized) {
			pion.protocols._adjustAccordionSize(); // In case Protocols were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.protocols.getHeight()});
		} else {
			pion.protocols.init();
			protocol_config_page_initialized = true;
		}
	} else if (page.id == 'user_config') {
		if (user_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.users.getHeight()});
		} else {
			pion.users.init();
			user_config_page_initialized = true;
		}
	} else if (page.id == 'system_config') {
		if (system_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.system.getHeight()});
		} else {
			pion.system.init();
			system_config_page_initialized = true;
		}
	} else if (page.onSelect) {
		page.onSelect();
	}
}

pion.getMaxMainStackContainerHeightWithoutScroll = function() {
	// The maximum height that 'main_stack_container' could have without 'outer' needing a scrollbar.
	var available_height = dojo.byId('outer').offsetHeight - (dojo.byId('topBar').offsetHeight + dojo.byId('bottomBar').offsetHeight);

	if (dojo.isIE) {
		// IE7 seems to reserve 15px at the bottom for a scrollbar.
		available_height -= 15;
	}

	return available_height;
}

dojo.declare("pion.widgets.MainStackContentHeader",
	[dijit._Widget, dijit._Templated],
	{
		title: '???',
		help: '',
		help_label: '',
		templateString:
			'<div class="config_header">' + 
				'<div class="title">${title}</div>' +
				'<a class="header help" href="http://pion.org/${help}" target="_blank">${help_label}</a>' +
				'<div class="bottom" />' +
			'</div>',
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			dojo.mixin(this, dojo.i18n.getLocalization("pion", "general"));
			if (this.help.length == 0)
				this.help_label = '';
			else if (this.help_label.length == 0) {
				// Can't use dojo.hasClass(this.domNode, 'nested'), because this.domNode isn't assigned yet.
				if ((' ' + this['class'] + ' ').indexOf(' nested ') >= 0)
					this.help_label = this.default_nested_header_help_label;
				else
					this.help_label = this.default_header_help_label;
			}
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);

dojo.declare("pion.widgets.ReactorGridHeader",
	[dijit._Widget, dijit._Templated],
	{
		title: '???',
		help: '',
		help_label: '',
		templateString:
			'<div class="reactor_grid_header">' + 
				'<div class="title">${title}</div>' +
				'<a class="header help" href="http://pion.org/${help}" target="_blank">${help_label}</a>' +
				'<div class="bottom" />' +
			'</div>',
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			dojo.mixin(this, dojo.i18n.getLocalization("pion", "general"));
			if (this.help.length == 0)
				this.help_label = '';
			else if (this.help_label.length == 0)
				this.help_label = this.default_grid_header_help_label;
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
		}
	}
);

// Override dijit.form.TextBox.prototype._setValueAttr(), because with the current version (1.2.1),
// dijit.form.FilteringSelect doesn't work right with dojox.data.XmlStore.
dijit.form.TextBox.prototype._setValueAttr = function(value, /*Boolean?*/ priorityChange, /*String?*/ formattedValue){
	var filteredValue;
	if(value !== undefined){
		filteredValue = this.filter(value);
		if(filteredValue !== null && ((typeof filteredValue != "number") || !isNaN(filteredValue))){
			//if(typeof formattedValue != "string"){
			if(formattedValue === undefined || !formattedValue.toString){
				formattedValue = this.format(filteredValue, this.constraints);
			}
		}else{ formattedValue = ''; }
	}
	if(formattedValue != null && formattedValue != undefined){
		this.textbox.value = formattedValue;
	}
	dijit.form.TextBox.superclass._setValueAttr.call(this, filteredValue, priorityChange);
}

// Override dijit.Dialog.prototype._size().
dijit.Dialog.prototype._size = function() {
	// summary:
	// 		Make sure the dialog is small enough to fit in viewport.

	var mb = dojo.marginBox(this.domNode);
	var viewport = dijit.getViewport();
	if(mb.w >= viewport.w || mb.h >= viewport.h){
		dojo.style(this.containerNode, {
			// DON'T change the width!
			//width: Math.min(mb.w, Math.floor(viewport.w * 0.75))+"px",

			// Changed .75 to .90 to get more real estate.
			//height: Math.min(mb.h, Math.floor(viewport.h * 0.75))+"px",
			height: Math.min(mb.h, Math.floor(viewport.h * 0.90))+"px",

			overflow: "auto",
			position: "relative"	// workaround IE bug moving scrollbar or dragging dialog
		});
	}
}

// See http://trac.dojotoolkit.org/ticket/6759 (in particular, multipledialog.patch)
// for an explanation of the following overrides of dijit.Dialog and dijit.DialogUnderlay methods.
dijit.DialogUnderlay.prototype.postCreate = function() {
	// summary: Append the underlay to the body
	dojo.body().appendChild(this.domNode);
	this.bgIframe = new dijit.BackgroundIframe(this.domNode);
	this._modalConnect = null;
}

dijit.DialogUnderlay.prototype.hide = function() {
	// summary: hides the dialog underlay
	this.domNode.style.display = "none";
	if(this.bgIframe.iframe){
		this.bgIframe.iframe.style.display = "none";
	}
	dojo.disconnect(this._modalConnect);
	this._modalConnect = null;
}

dijit.DialogUnderlay.prototype._onMouseDown = function(/*Event*/ evt) {
	dojo.stopEvent(evt);
	window.focus();
}

dijit.Dialog.prototype.show = function() {
	// summary: display the dialog

	if(this.open){ return; }
	
	// first time we show the dialog, there's some initialization stuff to do			
	if(!this._alreadyInitialized){
		this._setup();
		this._alreadyInitialized=true;
	}

	if(this._fadeOut.status() == "playing"){
		this._fadeOut.stop();
	}

	this._modalconnects.push(dojo.connect(window, "onscroll", this, "layout"));
	this._modalconnects.push(dojo.connect(window, "onresize", this, "layout"));
	//this._modalconnects.push(dojo.connect(dojo.doc.documentElement, "onkeypress", this, "_onKey"));
	this._modalconnects.push(dojo.connect(this.domNode, "onkeypress", this, "_onKey"));

	dojo.style(this.domNode, {
		opacity:0,
		visibility:""
	});
	
	this.open = true;
	this._loadCheck(); // lazy load trigger

	this._size();
	this._position();

	this._fadeIn.play();

	this._savedFocus = dijit.getFocus(this);

	if(this.autofocus){
		// find focusable Items each time dialog is shown since if dialog contains a widget the 
		// first focusable items can change
		this._getFocusItems(this.domNode);

		// set timeout to allow the browser to render dialog
		setTimeout(dojo.hitch(dijit,"focus",this._firstFocusItem), 50);
	}
}
