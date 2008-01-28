dojo.require("dijit.layout.StackContainer");
dojo.require("dojo.parser");	// scan page for widgets and instantiate them

var init = function() {
	initReactorConfiguration();
}

dojo.addOnLoad(init);

dojo.subscribe("main_stack_container-selectChild", configModeSelected);

function configModeSelected(page) {
	console.debug('Selected ' + page.title + ' configuration mode');
}
