dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dojox.data.XmlStore");
dojo.require("dojox.grid.Grid");
dojo.require("dojox.grid._data.model");
dojo.require("dojox.grid._data.dijitEditors");

var codec_pane_title_height = -1;
var codec_pane_body_height = 420;
var accordion_width = -1;
var unique_codec_id = 1;
var selected_codec_pane = null;
var codec_config_store;          // one item per codec
var codec_config_items;

var term_store = new dojox.data.XmlStore({url: '../tests/vocab_clf.xml', rootItem: 'Term', attributeMap: {'Term.id': '@id'}});

var attributes_by_column = [];
attributes_by_column[0] = 'text()';
attributes_by_column[1] = '@term';
attributes_by_column[2] = '@start';
attributes_by_column[3] = '@end';

function handleCellClick(e) {
	console.debug('e.rowIndex = ', e.rowIndex, ', e.cellIndex = ', e.cellIndex);
	if (e.cellIndex == 4) {
		console.debug('Removing row ', e.rowIndex); 
		grid.removeSelectedRows();
		var field_attrs = codec_config_store.getValues(selected_codec_pane.config_item, 'Field');
/**/
//This block is dependent on fixing a bug in setValues() in XmlStore.js.
		field_attrs.splice(e.rowIndex, 1);
		codec_config_store.setValues(selected_codec_pane.config_item, 'Field', field_attrs);
/**/
		// This bypasses the bug (and seems more efficient) but then the store doesn't know about the change, and can't revert it.
		//selected_codec_pane.config_item.element.removeChild(field_attrs[e.rowIndex].element);
	}
}

function handleCellEdit(inValue, inRowIndex, inFieldIndex) {
	console.debug('inValue = ', inValue, ', inRowIndex = ', inRowIndex, ', inFieldIndex = ', inFieldIndex);
/**/
	var field_attr_array = codec_config_store.getValues(selected_codec_pane.config_item, 'Field');

	// Make a new array of values for the Field attribute.  We start by making an identical list, then
	// we'll replace the one value affected by the edit.
	var new_field_attr_array = [];
	for (var i = 0; i < field_attr_array.length; ++i) {
		new_field_attr_array[i] = field_attr_array[i];
	}
	var newElement = field_attr_array[inRowIndex].element.cloneNode(true);
	var new_field_attr = new dojox.data.XmlItem(newElement, field_attr_array[inRowIndex].store);
	/**/
	// This is the long way of updating new_field_attr, which doesn't require calling setValue()
	// on something that isn't an item in the store.
	switch (inFieldIndex) {
		case 0:
			newElement.firstChild.nodeValue = inValue;
			break;
		case 1:
			newElement.setAttribute('term', inValue);
			break;
		case 2:
			newElement.setAttribute('start', inValue);
			break;
		case 3:
			newElement.setAttribute('end', inValue);
			break;
		default:
	}
	/**
	// Note: new_field_attr is NOT actually an item in codec_config_store, and in fact, is not contained
	// in codec_config_store (yet).  However, isItem() returns true, and so we can use setValue() to 
	// apply the change to new_field_attr.
	console.debug('codec_config_store.isItem(new_field_attr) = ', codec_config_store.isItem(new_field_attr));
	var attribute_to_change = attributes_by_column[inFieldIndex];
	codec_config_store.setValue(new_field_attr, attribute_to_change, inValue);
	/**/
	new_field_attr_array.splice(inRowIndex, 1, new_field_attr);
	
/////////////////////////////////////////////////////////////////////////////
//This line is dependent on fixing a bug in setValues() in XmlStore.js.
	codec_config_store.setValues(selected_codec_pane.config_item, 'Field', new_field_attr_array);
/////////////////////////////////////////////////////////////////////////////
/**/
}

var model = new dojox.grid.data.Table(null, []);

function initCodecConfigPage() {
	// fetchItemByIdentity and getIdentity are needed for FilteringSelect.
	term_store.fetchItemByIdentity = function(keywordArgs) {
		term_store.fetch({query: {id: keywordArgs.identity}, onItem: keywordArgs.onItem});
	}
	term_store.getIdentity = function(item) {
		return term_store.getValue(item, 'id');
	}

	codec_config_store = new dojox.data.XmlStore({url: '../tests/codecs_clf.xml'});

	function onComplete(items, request){
		codec_config_items = items;
		selected_codec_pane.config_item = items[0];
		populatePaneFromConfigItem(items[0]);

		var codec_config_accordion = dijit.byId('codec_config_accordion');
		for (var i = 1; i < items.length; ++i) {
			var title = codec_config_store.getValue(items[i], 'Name');
			var codec_pane = createNewCodecPane(title);
			codec_pane.config_item = items[i];
			codec_config_accordion.addChild(codec_pane);
		}
		adjustCodecAccordionSize();
	}	

	selected_codec_pane = dijit.byId('codec_config_accordion').getChildren()[0];
	codec_pane_title_height = selected_codec_pane.getTitleHeight();

	codec_config_store.fetch({ onComplete: onComplete });

	dojo.connect(grid, 'onCellClick', handleCellClick);
	dojo.connect(grid, 'onApplyCellEdit', handleCellEdit);

	// Make the accordion just narrow enough to avoid a horizontal scroll bar when
	// there's a vertical one.
	accordion_width = dijit.byId('codec_config_accordion').domNode.clientWidth - 15;

	adjustCodecAccordionSize();
	
	var form = dijit.byId('codec_form');

	dojo.query("input", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'change', function() {
			console.debug('change: selected codec is ', selected_codec_pane.title, ', form.getValues() = ', form.getValues());
			dojo.addClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.save", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('save: selected codec is ', selected_codec_pane.title, ', form.getValues() = ', form.getValues());

			var form_data = form.getValues();
			codec_config_store.setValue(selected_codec_pane.config_item, 'Name', form_data.codec_name);
			codec_config_store.setValue(selected_codec_pane.config_item, 'Comment', form_data.comment);
			codec_config_store.setValue(selected_codec_pane.config_item, 'EventType', form_data.codec_type);
			codec_config_store.save();

			selected_codec_pane.title = form_data.codec_name;
			dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_codec_pane.domNode).forEach('item.firstChild.nodeValue = selected_codec_pane.title;');

			dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.cancel", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			codec_config_store.revert();
			populatePaneFromConfigItem(selected_codec_pane.config_item);
			dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');
		})
	});
	dojo.query(".dijitButton.delete", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			console.debug('delete: selected codec is ', selected_codec_pane.title);

			var pane_to_delete = selected_codec_pane;

			codec_config_store.deleteItem(pane_to_delete.config_item);
			codec_config_store.save();
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('codec_config_accordion').forward();
			
			dijit.byId('codec_config_accordion').removeChild(pane_to_delete);
			adjustCodecAccordionSize();
		})
	});
	dojo.query(".dijitButton.delete_row", selected_codec_pane.domNode).forEach(function(n) {
		dojo.connect(n, 'click', function() {
			//console.debug('delete: selected codec is ', selected_codec_pane.title);

			var pane_to_delete = selected_codec_pane;
			
			// By doing this, not only is the next pane after the deleted pane selected, rather than the first pane,
			// but it also bypasses a bug that makes the automatically selected first pane have the wrong size.
			dijit.byId('codec_config_accordion').forward();
			
			dijit.byId('codec_config_accordion').removeChild(pane_to_delete);
			adjustCodecAccordionSize();
		})
	});

	setTimeout("dijit.byId('grid').resize()", 200);
	setTimeout("dijit.byId('grid').update()", 200);
}

function populatePaneFromConfigItem(item) {
	var form_data = {};
	var form = dijit.byId('codec_form');
	form_data.codec_name = codec_config_store.getValue(item, 'Name');
	form_data.comment = codec_config_store.getValue(item, 'Comment');
	if (!form_data.comment) form_data.comment = '';
	form_data.codec_type = codec_config_store.getValue(item, 'EventType');
	if (!form_data.codec_type) form_data.codec_type = 1;
	form.setValues(form_data);
	selected_codec_pane.title = form_data.codec_name;
	dojo.query('.dijitAccordionTitle .dijitAccordionText', selected_codec_pane.domNode).forEach('item.firstChild.nodeValue = selected_codec_pane.title;');
	
	var field_attrs = codec_config_store.getValues(item, 'Field');
	selected_codec_pane.field_table = [];
	for (var i = 0; i < field_attrs.length; ++i) {
		var field_table_row = [];
		console.debug('codec_config_store.isItem(field_attrs[i]) = ', codec_config_store.isItem(field_attrs[i]));
		for (var j = 0; j < attributes_by_column.length; ++j) {
			field_table_row[j] = codec_config_store.getValue(field_attrs[i], attributes_by_column[j]);
		}
		/*
		field_table_row[0] = codec_config_store.getValue(field_attrs[i], 'text()');
		field_table_row[1] = codec_config_store.getValue(field_attrs[i], '@term');
		field_table_row[2] = codec_config_store.getValue(field_attrs[i], '@start');
		field_table_row[3] = codec_config_store.getValue(field_attrs[i], '@end');
		*/
		selected_codec_pane.field_table.push(field_table_row);	
	}

	model = new dojox.grid.data.Table(null, selected_codec_pane.field_table);
	grid.setModel(model);
}

function createNewCodecPane(title) {
	var codec_pane_node = document.createElement('span');
	var empty_form_node = document.createElement('form');
	codec_pane_node.appendChild(empty_form_node);
	var codec_pane = new dijit.layout.AccordionPane({ 'class': 'codec_pane', title: title }, codec_pane_node);
	return codec_pane;
}

function addNewCodec() {
	var codec_config_accordion = dijit.byId('codec_config_accordion');
	if (!codec_config_accordion.hasChildren()) {
		// It would be nice to have code here to workaround the sizing bug that occurs after 
		// deleting all the codecs and then adding one.
	}
	var item = codec_config_store.newItem({tagName: 'Codec'});
	var title = 'New Codec ' + unique_codec_id++;
	codec_config_store.setValue(item, 'Name', title);

	// Set other values?

	var codec_pane = createNewCodecPane(title);
	codec_pane.config_item = item;
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

	// TODO: ask the user what to do if there are unsaved changes.
	// Currently, they stay until 'save', 'cancel' or 'delete' is pressed, in any pane.
	dojo.removeClass(selected_codec_pane.domNode, 'unsaved_changes');

	// Move all the DOM nodes for the form from the previously selected pane to the newly selected one.
	var form_node_to_move = dojo.query('form', selected_codec_pane.domNode)[0];
	form_node_to_move.parentNode.replaceChild(document.createElement('form'), form_node_to_move);
	var form_node_to_replace = dojo.query('form', pane.domNode)[0];
	form_node_to_replace.parentNode.replaceChild(form_node_to_move, form_node_to_replace);

	// Update selected_codec_pane, so populatePaneFromConfigItem() and the form buttons will now act on the newly selected codec.
	selected_codec_pane = pane;
	populatePaneFromConfigItem(pane.config_item);

	setTimeout("dijit.byId('grid').resize()", 200);
	setTimeout("dijit.byId('grid').update()", 200);
}
