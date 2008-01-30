dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");

var codec_pane_title_height = -1;
var codec_pane_body_height = 350;
var accordion_width = -1;
var unique_codec_id = 1;
var selected_codec_pane = null;
var default_codec_data;

function initCodecConfigPage() {
	// Get the default data from the HTML.  This will have one member for each text box node,
	// with value equal to the node's value attribute, or the empty string if it doesn't have one.
	var form = dijit.byId('codec_form');
	default_codec_data = form.getValues();

	selected_codec_pane = dijit.byId('codec_config_accordion').getChildren()[0];
	selected_codec_pane.codec_data = default_codec_data;
	codec_pane_title_height = selected_codec_pane.getTitleHeight();

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	accordion_width = dijit.byId('codec_config_accordion').domNode.clientWidth - 15;

	adjustCodecAccordionSize();
	
	dojo.query("input", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'change', function() {
			console.debug('change: selected codec is ', selected_codec_pane.title, ', form.getValues() = ', form.getValues());
			dojo.addClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.save", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('save: selected codec is ', selected_codec_pane.title, ', form.getValues() = ', form.getValues());
			selected_codec_pane.codec_data = form.getValues();
			selected_codec_pane.title = selected_codec_pane.codec_data.codec_name;
			dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_codec_pane.domNode).forEach('item.firstChild.nodeValue = selected_codec_pane.title;');
			dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.cancel", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			form.setValues(selected_codec_pane.codec_data);
			console.debug('cancel: selected codec is ', selected_codec_pane.title, ', form.getValues() = ', form.getValues());
			dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.delete", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('delete: selected codec is ', selected_codec_pane.title);

			var pane_to_delete = selected_codec_pane;
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('codec_config_accordion').forward();
			
			dijit.byId('codec_config_accordion').removeChild(pane_to_delete);
			adjustCodecAccordionSize();
		})
	});
}

function createNewCodecPane() {
	unique_codec_id++;
	var codec_pane_node = document.createElement('span');
	var empty_form_node = document.createElement('form');
	codec_pane_node.appendChild(empty_form_node);
	var title = 'Codec ' + unique_codec_id;
	var codec_pane = new dijit.layout.AccordionPane({ 'class': 'codec_pane', title: title }, codec_pane_node);
	codec_pane.codec_data = default_codec_data;
	return codec_pane;
}

function addNewCodec() {
	var codec_config_accordion = dijit.byId('codec_config_accordion');
	if (!codec_config_accordion.hasChildren()) {
		// It would be nice to have code here to workaround the sizing bug that occurs after 
		// deleting all the codecs and then adding one.
	}
	var codec_pane = createNewCodecPane();
	codec_config_accordion.addChild(codec_pane);
	adjustCodecAccordionSize();
	codec_config_accordion.selectChild(codec_pane);
	console.debug("codec_config_accordion.domNode.style.height = " + codec_config_accordion.domNode.style.height);
}

function addNewRowForCodec() {
	alert('not implemented');
}

function adjustCodecAccordionSize() {
	var codec_config_accordion = dijit.byId('codec_config_accordion');
	var num_codecs = codec_config_accordion.getChildren().length;
	console.debug("num_codecs = " + num_codecs);
	codec_config_accordion.resize({h: codec_pane_body_height + num_codecs * codec_pane_title_height, w: accordion_width});
}

dojo.subscribe("codec_config_accordion-selectChild", codecPaneSelected);

function codecPaneSelected(pane) {
	console.debug('Selected ' + pane.title);

	// Probably we should ask the user what to do if there are unsaved changes, 
	// but for now, they're just lost.
	dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');

	// Move all the DOM nodes for the form from the previously selected pane to the newly selected one.
	var form_node_to_move = dojo.query('form', selected_codec_pane.domNode)[0];
	form_node_to_move.parentNode.replaceChild(document.createElement('form'), form_node_to_move);
	var form_node_to_replace = dojo.query('form', pane.domNode)[0];
	form_node_to_replace.parentNode.replaceChild(form_node_to_move, form_node_to_replace);

	// Load the data for the newly selected codec into the form widget.
	var form = dijit.byId('codec_form');
	form.setValues(pane.codec_data);
	
	// Update selected_codec_pane, so the form buttons will now act on the newly selected codec.
	selected_codec_pane = pane;
}
