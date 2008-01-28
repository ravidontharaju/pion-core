dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");

var users = [{first_name: 'Mignon'}];

function addNewUser() {
	var new_user = {};
	users.push(new_user);
	var title = 'User ' + users.length;
	var user_pane = new dijit.layout.AccordionPane({ "class": "user_pane", title: title, style: "overflow: auto" });
	
	var buttons_div = document.createElement("div");
	buttons_div.className = 'save_cancel_delete';
	var save_button = new dijit.form.Button({label: 'Save', type: 'submit'});
	buttons_div.appendChild(save_button.domNode);
	var cancel_button = new dijit.form.Button({label: 'Cancel'});
	buttons_div.appendChild(cancel_button.domNode);
	var delete_button = new dijit.form.Button({label: 'Delete'});
	buttons_div.appendChild(delete_button.domNode);
	var table = document.createElement("table");
	table.innerHTML = '<tr><td><label>Last name</label></td><td><input dojoType="dijit.form.TextBox" name="last_name"></td></tr>'
					+ '<tr><td><label>First name</label></td><td><input dojoType="dijit.form.TextBox" name="first_name"></td></tr>'
					+ '<tr><td><label>Username</label></td><td><input dojoType="dijit.form.TextBox" name="username"></td></tr>'
					+ '<tr><td><label>Password</label></td><td><input dojoType="dijit.form.TextBox" name="password"></td></tr>';

	var pane_body_node = dojo.query('.dijitAccordionBody', user_pane.domNode)[0];
	pane_body_node.appendChild(buttons_div);
	pane_body_node.appendChild(table);
	pane_body_node.appendChild(buttons_div.cloneNode(true));

	var user_config_accordion = dijit.byId("user_config_accordion");
	user_config_accordion.addChild(user_pane);
	user_config_accordion.selectChild(user_pane);
}
