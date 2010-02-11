dojo.registerModulePath("pion", "/scripts");
dojo.registerModulePath("plugins", "/plugins");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.Dialog");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.TextBox");
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

var reactor_config_page_initialized = false;
var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var database_config_page_initialized = false;
var protocol_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var file_protocol = false;
var firefox_on_mac;

pion.doDeleteConfirmationDialog = function(message, delete_function, delete_function_arg) {
	var dialog = pion.delete_confirmation_dialog;
	if (!dialog) {
		dialog = new dijit.Dialog({
			title: 'Delete Confirmation',
			content: '<div id="are_you_sure"></div>'
					 + '<button id="cancel_delete" dojoType="dijit.form.Button" class="cancel">Cancel</button>'
					 + '<button id="confirm_delete" dojoType=dijit.form.Button class="delete">Delete</button>'
		});

		dojo.byId('cancel_delete').onclick = function() { dialog.onCancel(); };

		// Save for future use.
		pion.delete_confirmation_dialog = dialog;
	}
	dojo.byId('are_you_sure').innerHTML = message;
	dojo.byId('confirm_delete').onclick = function() { dialog.onCancel(); delete_function(delete_function_arg); };
	dialog.show();
	setTimeout("dijit.byId('cancel_delete').focus()", 500);
}

pion.initOptionalValue = function(store, item, new_item_object, tag_name, optional_default) {
	if (store.hasAttribute(item, tag_name)) {
		new_item_object[tag_name] = store.getValue(item, tag_name);
	} else if (optional_default !== undefined) {
		new_item_object[tag_name] = optional_default;
	}
}

// Contains ids of all the children of 'main_stack_container' in index.html.
pion.resources_by_tab_id = {
	reactor_config:  '/config/reactors',
	vocab_config:    '/config/vocabularies',
	codec_config:    '/config/codecs',
	database_config: '/config/databases',
	protocol_config: '/config/protocols',
	user_config:     '/config/users',
	system_config:   '/config'
};

// This is called by pion.services.init(), since the latter may (indirectly) add to pion.resources_by_tab_id.
pion.initTabs = function() {
	dojo.xhrGet({
		url: '/config/users/' + dojo.cookie('user'),
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			var main_stack = dijit.byId('main_stack_container');
			var permitted_resources = dojo.map(response.getElementsByTagName('Permit'), function(resource) {
				return dojo.isIE? resource.childNodes[0].nodeValue : resource.textContent;
			});

			// TODO: it would be a lot nicer to add only the permitted tabs, instead of creating
			// all of them and then deleting the ones not found on the list of permitted tabs.
			for (var tab_id in pion.resources_by_tab_id) {
				if (dojo.indexOf(permitted_resources, pion.resources_by_tab_id[tab_id]) == -1) {
					main_stack.removeChild(dijit.byId(tab_id));
				}
			}

			var tabs = main_stack.getChildren();
			if (tabs.length > 0) {
				main_stack.selectChild(tabs[0]);
				configPageSelected(tabs[0]);
			} else {
				alert('There are no access rights defined for this user account.  You may need to reset your users.xml file.');
			}

			// Don't be tempted to move this earlier to avoid calling configPageSelected() above:
			// selectChild(page) won't trigger configPageSelected(page) if page was already selected.
			dojo.subscribe("main_stack_container-selectChild", configPageSelected);

			return response;
		}
	});
	pion.tab_ids_by_resource = {};
	for (var tab_id in pion.resources_by_tab_id) {
		pion.tab_ids_by_resource[pion.resources_by_tab_id[tab_id]] = tab_id;
	}
}

var init = function() {
	dojo.byId('outer').style.visibility = 'visible';

	file_protocol = (window.location.protocol == "file:");
	firefox_on_mac = navigator.userAgent.indexOf('Mac') >= 0 && navigator.userAgent.indexOf('Firefox') >= 0;

	// Send a request to /config to see if a login is needed.
	// login_success_callback() will be called if the user was already logged in, or after a login succeeds.
	// Before login_success_callback() is called, a license key check will be done, and the user may be prompted to 
	// enter a key; however, even if they don't enter a valid key, login_success_callback() will still be called.
	var login_success_callback = function() {
		pion.terms.init();
		pion.services.init();
	}
	pion.key_service_running = false;
	dojo.xhrGet({
		url: '/config',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			// The user must be logged in since the request succeeded.
			dojo.cookie("logged_in", "true", {expires: 1}); // 1 day
			dojo.byId('current_user_menu_section').style.visibility = 'visible';
			dojo.byId('current_user').innerHTML = dojo.cookie('user');
			pion.about.checkKeyStatus({always_callback: login_success_callback});
		},
		error: function(response, ioArgs) {
			if (ioArgs.xhr.status == 401) {
				if (!dojo.cookie("logged_in")) {
					location.replace('login.html'); // exit and go to main login page
				}
				pion.login.doLoginDialog({success_callback: login_success_callback});
			} else {
				console.error('HTTP status code: ', ioArgs.xhr.status);
			}
			return response;
		}
	});
	/*
	// This block seems obsolete.
	if (!file_protocol) {
		// do a fetch just to check if the datastore is available
		pion.terms.store.fetch({onError: function(errorData, request){
			alert('dojo.data error: url = ' + request.store._url + '\nIs pion running?');
			console.debug('window.location.protocol = ', window.location.protocol);
		}});
	}
	*/
}

dojo.addOnLoad(init);

function configPageSelected(page) {
	console.debug('Selected ' + page.title + ' configuration page');
	pion.current_page = page.title;
	if (page.title == "Reactors") {
		if (reactor_config_page_initialized) {
			pion.reactors.reselectCurrentWorkspace(); // In case current workspace was created via another page.
			dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});
		} else {
			pion.reactors.init();
			reactor_config_page_initialized = true;
		}
	} else if (page.title == "Vocabularies") {
		if (vocab_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.vocabularies.getHeight()});
		} else {
			pion.vocabularies.init();
			vocab_config_page_initialized = true;
		}
	} else if (page.title == "Codecs") {
		if (codec_config_page_initialized) {
			pion.codecs._adjustAccordionSize(); // In case Codecs were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.codecs.getHeight()});
		} else {
			pion.codecs.init();
			codec_config_page_initialized = true;
		}
	} else if (page.title == "Databases") {
		if (database_config_page_initialized) {
			pion.databases._adjustAccordionSize(); // In case Databases were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.databases.getHeight()});
		} else {
			pion.databases.init();
			database_config_page_initialized = true;
		}
	} else if (page.title == "Protocols") {
		if (protocol_config_page_initialized) {
			pion.protocols._adjustAccordionSize(); // In case Protocols were added via another page.
			dijit.byId('main_stack_container').resize({h: pion.protocols.getHeight()});
		} else {
			pion.protocols.init();
			protocol_config_page_initialized = true;
		}
	} else if (page.title == "Users") {
		if (user_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.users.getHeight()});
		} else {
			pion.users.init();
			user_config_page_initialized = true;
		}
	} else if (page.title == "System") {
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

