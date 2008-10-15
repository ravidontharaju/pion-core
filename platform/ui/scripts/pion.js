dojo.registerModulePath("pion", "/scripts");
dojo.registerModulePath("plugins", "/plugins");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them
dojo.require("pion.reactors");
dojo.require("pion.vocabularies");
dojo.require("pion.codecs");
dojo.require("pion.databases");
dojo.require("pion.protocols");
dojo.require("pion.users");
dojo.require("pion.system");
dojo.require("pion.login");
dojo.require("pion.terms");
dojo.require("pion.about");

var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var database_config_page_initialized = false;
var protocol_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var file_protocol = false;
var firefox_on_mac;

pion.handleXhrError = function(response, ioArgs, xhrFunc, finalErrorHandler) {
	console.debug('In pion.handleXhrError: ioArgs.args = ', ioArgs.args);
	if (ioArgs.xhr.status == 401) {
		if (pion.login.login_pending) {
			// redo the request when the login succeeds
			var h = dojo.connect(pion.login, "onLoginSuccess", function(){ dojo.disconnect(h); xhrFunc(ioArgs.args)});
		} else {
			// if user logged out, exit and go to main login page
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html');
			}

			// make user log in, then redo the request
			pion.login.doLoginDialog(function(){xhrFunc(ioArgs.args)});
		}
		return;
	} else {
		if (ioArgs.xhr.status == 500) {
			var dialog = new dijit.Dialog({title: 'Pion Server Error'});
			dialog.setContent(response.responseText);
			dialog.show();
		}
		if (finalErrorHandler) {
			finalErrorHandler();
		}
	}
	return response;
}

pion.handleXhrGetError = function(response, ioArgs) {
	console.debug('In pion.handleXhrGetError: ioArgs.args = ', ioArgs.args);
	return pion.handleXhrError(response, ioArgs, dojo.xhrGet);
}

pion.getXhrErrorHandler = function(xhrFunc, args_mixin, finalErrorHandler) {
	return function(response, ioArgs) {
		dojo.mixin(ioArgs.args, args_mixin);
		return pion.handleXhrError(response, ioArgs, xhrFunc, finalErrorHandler);
	}
}

pion.handleFetchError = function(errorData, request) {
	console.debug('In pion.handleFetchError: request = ', request, ', errorData = ' + errorData);
	if (errorData.status == 401) {
		if (pion.login.login_pending) {
			// redo the request when the login succeeds
			var h = dojo.connect(pion.login, "onLoginSuccess", function(){ dojo.disconnect(h); request.store.fetch(request); });
		} else {
			// if user logged out, exit and go to main login page
			if (!dojo.cookie("logged_in")) {
				location.replace('login.html');
			}

			// make user log in, then redo the request
			pion.login.doLoginDialog(function(){request.store.fetch(request)});
		}
		return;
	}
}

var init = function() {
	dojo.byId('outer').style.visibility = 'visible';

	dojo.subscribe("main_stack_container-selectChild", configPageSelected);

	file_protocol = (window.location.protocol == "file:");
	firefox_on_mac = navigator.userAgent.indexOf('Mac') >= 0 && navigator.userAgent.indexOf('Firefox') >= 0;

	// Send a request to /config to see if a login is needed.
	// pion.terms.init() and pion.reactors.init() will be called as soon as the 
	// request succeeds, or if it fails, as soon as the login succeeds.
	dojo.xhrGet({
		url: '/config',
		preventCache: true,
		handleAs: 'xml',
		timeout: 5000,
		load: function(response, ioArgs) {
			// The user must be logged in since the request succeeded.
			dojo.cookie("logged_in", "true", {expires: 1}); // 1 day

			pion.terms.init();
			pion.reactors.init();
		},
		error: function(response, ioArgs) {
			if (ioArgs.xhr.status == 401) {
				if (!dojo.cookie("logged_in")) {
					location.replace('login.html'); // exit and go to main login page
				}
				pion.login.doLoginDialog(function(){
					pion.terms.init();
					pion.reactors.init();
				});
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
	if (page.title == "Reactors") {
		pion.reactors.reselectCurrentWorkspace(); // In case current workspace was created via another page.
		dijit.byId('main_stack_container').resize({h: pion.reactors.getHeight()});
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
	}
}
