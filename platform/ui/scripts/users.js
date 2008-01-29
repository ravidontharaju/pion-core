dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");

var user_pane_title_height = -1;
var user_pane_body_height = 180;
var unique_user_id = 1;
var original_pane_body_node = null;

function initUserConfigPage() {
	// Remove (and save for later cloning) the contents of the node that will hold the user config accordion.
	var original_node = dojo.byId('user_config_accordion');
	original_pane_body_node = original_node.removeChild(dojo.query('.user_pane')[0]);
	
	var user_config_accordion = new dijit.layout.AccordionContainer({}, original_node);
	var user_pane = createNewUserPane();
	user_config_accordion.addChild(user_pane);
	user_config_accordion.startup();

	user_pane_title_height = user_pane.getTitleHeight();
	console.debug("user_config_accordion.domNode.style.height = " + user_config_accordion.domNode.style.height);
	adjustAccordionHeight();
}

function createNewUserPane() {
	var pane_body_node = original_pane_body_node.cloneNode(true);	
	var title = 'User ' + unique_user_id++;
	var user_pane = new dijit.layout.AccordionPane({ 'class': 'user_pane', title: title }, pane_body_node);

	dojo.query(".dijitButton.delete", user_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() { 
			console.debug('user_pane = ', user_pane);
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('user_config_accordion').forward();
			
			dijit.byId('user_config_accordion').removeChild(user_pane);
			adjustAccordionHeight();
		})
	});

	return user_pane;
}

function addNewUser() {
	var user_config_accordion = dijit.byId('user_config_accordion');
	if (!user_config_accordion.hasChildren()) {
		// It would be nice to have code here to workaround the sizing bug that occurs after 
		// deleting all the users and then adding one.
	}
	var user_pane = createNewUserPane();
	user_config_accordion.addChild(user_pane);
	adjustAccordionHeight();
	user_config_accordion.selectChild(user_pane);
	console.debug("user_config_accordion.domNode.style.height = " + user_config_accordion.domNode.style.height);
}

function adjustAccordionHeight() {
	var user_config_accordion = dijit.byId('user_config_accordion');
	var num_users = user_config_accordion.getChildren().length;
	console.debug("num_users = " + num_users);
	user_config_accordion.resize({h: user_pane_body_height + num_users * user_pane_title_height});
}
