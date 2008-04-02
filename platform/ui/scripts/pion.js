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
dojo.require("pion.users");
dojo.require("pion.system");

var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var database_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var file_protocol = false;
var firefox_on_mac;

var init = function() {
	dojo.byId('outer').style.visibility = 'visible';

	dojo.subscribe("main_stack_container-selectChild", configPageSelected);

	file_protocol = (window.location.protocol == "file:");
	firefox_on_mac = navigator.userAgent.indexOf('Mac') >= 0 && navigator.userAgent.indexOf('Firefox') >= 0;
	pion.reactors.init();

	if (!file_protocol) {
		// do a fetch just to check if the datastore is available
		pion.codecs.term_store.fetch({onError: function(errorData, request){
			alert('dojo.data error: url = ' + request.store._url + '\nIs pion running?');
			console.debug('window.location.protocol = ', window.location.protocol);
		}});
	}
}

dojo.addOnLoad(init);

function configPageSelected(page) {
	console.debug('Selected ' + page.title + ' configuration page');
	if (page.title == "Reactors") {
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
			dijit.byId('main_stack_container').resize({h: pion.codecs.getHeight()});
		} else {
			pion.codecs.init();
			codec_config_page_initialized = true;
		}
	} else if (page.title == "Databases") {
		if (database_config_page_initialized) {
			dijit.byId('main_stack_container').resize({h: pion.databases.getHeight()});
		} else {
			pion.databases.init();
			database_config_page_initialized = true;
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
