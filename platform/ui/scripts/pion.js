dojo.require("dijit.layout.StackContainer");
dojo.require("dojox.widget.FileInput");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them

var user_config_page_initialized = false;
var codec_config_page_initialized = false;
var system_config_page_initialized = false;

var init = function() {
	dojo.byId('outer').style.visibility = 'visible';
	initReactorConfigPage();
	
	// do a fetch just to check if the datastore is available
	term_store.fetch({onError: function(errorData, request){
		alert('dojo.data error: url = ' + request.store._url + '\nIs pion running?');
	}});
}

dojo.addOnLoad(init);

dojo.subscribe("main_stack_container-selectChild", configPageSelected);

function configPageSelected(page) {
	console.debug('Selected ' + page.title + ' configuration page');
	if (page.title == "Users" && !user_config_page_initialized) {
		initUserConfigPage();
		user_config_page_initialized = true;
	} else if (page.title == "Codecs" && !codec_config_page_initialized) {
		initCodecConfigPage();
		codec_config_page_initialized = true;
	} else if (page.title == "System" && !system_config_page_initialized) {
		initSystemConfigPage();
		system_config_page_initialized = true;
	}
}
