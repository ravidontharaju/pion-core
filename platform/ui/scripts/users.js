dojo.provide("pion.users");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");

var user_pane_title_height = -1;
var accordion_width = -1;
var unique_user_id = 1;
var selected_user_pane = null;
var default_user_data;

pion.users.getHeight = function() {
	// set by adjustUserAccordionSize
	return pion.users.height;
}

pion.users.init = function() {
	// Get the default data from the HTML.  This will have one member for each text box node,
	// with value equal to the node's value attribute, or the empty string if it doesn't have one.
	var form = dijit.byId('user_form');
	default_user_data = form.getValues();

	selected_user_pane = dijit.byId('user_config_accordion').getChildren()[0];
	selected_user_pane.user_data = default_user_data;
	user_pane_title_height = selected_user_pane.getTitleHeight();

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	accordion_width = dijit.byId('user_config_accordion').domNode.clientWidth - 15;

	adjustUserAccordionSize();
	
	dojo.query("input", selected_user_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'change', function() {
			console.debug('change: selected user is ', selected_user_pane.title, ', form.getValues() = ', form.getValues());
			dojo.addClass(selected_user_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.save", selected_user_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('save: selected user is ', selected_user_pane.title, ', form.getValues() = ', form.getValues());
			selected_user_pane.user_data = form.getValues();
			selected_user_pane.title = selected_user_pane.user_data.last_name + ', ' + selected_user_pane.user_data.first_name;
			dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_user_pane.domNode).forEach('item.firstChild.nodeValue = selected_user_pane.title;');
			dojo.removeClass(selected_user_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.cancel", selected_user_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			form.setValues(selected_user_pane.user_data);
			console.debug('cancel: selected user is ', selected_user_pane.title, ', form.getValues() = ', form.getValues());
			dojo.removeClass(selected_user_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.delete", selected_user_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('delete: selected user is ', selected_user_pane.title);

			var pane_to_delete = selected_user_pane;
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('user_config_accordion').forward();
			
			dijit.byId('user_config_accordion').removeChild(pane_to_delete);
			adjustUserAccordionSize();
		})
	});
}

function createNewUserPane() {
	unique_user_id++;
	var user_pane_node = document.createElement('span');
	var empty_form_node = document.createElement('form');
	user_pane_node.appendChild(empty_form_node);
	var title = 'User ' + unique_user_id;
	var user_pane = new dijit.layout.AccordionPane({ 'class': 'user_pane', title: title }, user_pane_node);
	user_pane.user_data = default_user_data;
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
	adjustUserAccordionSize();
	user_config_accordion.selectChild(user_pane);
	console.debug("user_config_accordion.domNode.style.height = " + user_config_accordion.domNode.style.height);
}

function adjustUserAccordionSize() {
	var user_config_accordion = dijit.byId('user_config_accordion');
	var num_users = user_config_accordion.getChildren().length;
	console.debug("num_users = " + num_users);

	var user_pane_body_height = 190;
	var accordion_height = user_pane_body_height + num_users * user_pane_title_height;
	user_config_accordion.resize({h: accordion_height, w: accordion_width});

	// TODO: replace 200 with some computed value
	pion.users.height = accordion_height + 200;
	dijit.byId('main_stack_container').resize({h: pion.users.height});
}

dojo.subscribe("user_config_accordion-selectChild", userPaneSelected);

function userPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	// Probably we should ask the user what to do if there are unsaved changes, 
	// but for now, they're just lost.
	dojo.removeClass(selected_user_pane.domNode, 'unsaved_changes');

	// Move all the DOM nodes for the form from the previously selected pane to the newly selected one.
	var form_node_to_move = dojo.query('form', selected_user_pane.domNode)[0];
	form_node_to_move.parentNode.replaceChild(document.createElement('form'), form_node_to_move);
	var form_node_to_replace = dojo.query('form', pane.domNode)[0];
	form_node_to_replace.parentNode.replaceChild(form_node_to_move, form_node_to_replace);

	// Load the data for the newly selected user into the form widget.
	var form = dijit.byId('user_form');
	form.setValues(pane.user_data);
	
	// Update selected_user_pane, so the form buttons will now act on the newly selected user.
	selected_user_pane = pane;
}
