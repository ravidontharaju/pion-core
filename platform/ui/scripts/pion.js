dojo.registerModulePath("pion", "../../scripts");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.form.CheckBox");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them
dojo.require("pion.vocabularies");

var vocab_config_page_initialized = false;
var codec_config_page_initialized = false;
var user_config_page_initialized = false;
var system_config_page_initialized = false;
var file_protocol = false;

var init = function() {
	dojo.byId('outer').style.visibility = 'visible';

	file_protocol = (window.location.protocol == "file:");
	initReactorConfigPage();
	
	if (!file_protocol) {
		// do a fetch just to check if the datastore is available
		term_store.fetch({onError: function(errorData, request){
			alert('dojo.data error: url = ' + request.store._url + '\nIs pion running?');
			console.debug('window.location.protocol = ', window.location.protocol);
		}});
	}
}

dojo.addOnLoad(init);

dojo.subscribe("main_stack_container-selectChild", configPageSelected);

function configPageSelected(page) {
	console.debug('Selected ' + page.title + ' configuration page');
	if (page.title == "Vocabularies" && !vocab_config_page_initialized) {
		pion.vocabularies.init();
		vocab_config_page_initialized = true;
	} else if (page.title == "Codecs" && !codec_config_page_initialized) {
		initCodecConfigPage();
		codec_config_page_initialized = true;
	} else if (page.title == "Users" && !user_config_page_initialized) {
		initUserConfigPage();
		user_config_page_initialized = true;
	} else if (page.title == "System" && !system_config_page_initialized) {
		initSystemConfigPage();
		system_config_page_initialized = true;
	}
}
