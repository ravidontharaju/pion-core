dojo.provide("pion._base.format");

// These are empirical values obtained through inspecting the html in Firebug.
// TODO: find a way to calculate them using dojo.
pion.grid_cell_padding = 8;
pion.scrollbar_width = 20;
pion.datetime_cell_width = 100;

// Substitutes entity references for characters that have special meaning in XML.
pion.escapeXml = function(value) {
	if (value === false || value === 0) {
		return value.toString();
	} else if (value) {
		return value.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	} else {
		return '';
	}
}

pion.makeXmlLeafElement = function(tag_name, value) {
	return '<' + tag_name + '>' + pion.escapeXml(value) + '</' + tag_name + '>';
}

pion.makeXmlLeafElementFromItem = function(store, item, tag_name, optional_default) {
	if (store.hasAttribute(item, tag_name)) {
		var value = store.getValue(item, tag_name); // From dojo.data.api.Read, this must be defined.
		if (value.toString() == '') {
			return '';
		} else {
			return pion.makeXmlLeafElement(tag_name, value);
		}
	} else if (optional_default !== undefined) {
		return pion.makeXmlLeafElement(tag_name, optional_default);
	} else {
		return '';
	}
}

pion.xmlCellFormatter = function(d) {
	if (d == '')
		return '';
	if (d && d.toString()) {
		return pion.escapeXml(d);
	} else {
		return this.defaultValue;
	}
}

pion.xmlCellFormatter2 = function(d) {
	if (d == '')
		return '';
	if (d && d.toString()) {
		if (d.toString().substr(0, 8) == '<button ')
			return d;

		// This is a workaround for a dojo "feature" that tries to block html formatting in cells.
		// See http://bugs.dojotoolkit.org/ticket/9173
		if (d.toString().substr(0, 11) == '&lt;button ')
			return d.replace(/&lt;/g, '<');

		return pion.escapeXml(d);
	} else {
		return this.defaultValue;
	}
}

pion.datetimeCellFormatter = function(t) {
	return Date(t * 1000).toLocaleString();
}

pion.utcDatetimeCellFormatter = function(t) {
	var d = new Date(t * 1000);
	var month = d.getUTCMonth() + 1;
	var date = d.getUTCDate();
	var hour = d.getUTCHours();
	var min = d.getUTCMinutes();

	if (month < 10)
		month = '0' + month;
	if (date < 10)
		date = '0' + date;
	if (hour < 10)
		hour = '0' + hour;
	if (min < 10)
		min = '0' + min;

	//return t + ' (' + d.getUTCFullYear() + '-' + month + '-' + date + ' ' + hour + ':' + min + ')';
	return d.getUTCFullYear() + '-' + month + '-' + date + ' ' + hour + ':' + min;
}

pion.localDatetimeCellFormatter = function(t) {
	var d = new Date(t * 1000);
	var month = d.getMonth() + 1;
	var date = d.getDate();
	var hour = d.getHours();
	var min = d.getMinutes();

	if (month < 10)
		month = '0' + month;
	if (date < 10)
		date = '0' + date;
	if (hour < 10)
		hour = '0' + hour;
	if (min < 10)
		min = '0' + min;

	//return t + ' (' + d.getFullYear() + '-' + month + '-' + date + ' ' + hour + ':' + min + ')';
	return d.getFullYear() + '-' + month + '-' + date + ' ' + hour + ':' + min;
}

pion.makeDeleteButton = function() {
	return '<button dojoType=dijit.form.Button class="delete_row"></button>';
}

pion.makeEditButton = function() {
	return '<button dojoType=dijit.form.Button><img src="images/icon-edit.png" alt="EDIT" border="0" /></button>';
}

pion.makeInsertAboveButton = function() {
	return '<button dojoType=dijit.form.Button class="insert_row"><img src="images/arrowUp.png" alt="INSERT ABOVE" border="0" /></button>';
}

pion.makeSearchButton = function() {
	return '<button dojoType=dijit.form.Button class="search"></button>';
}