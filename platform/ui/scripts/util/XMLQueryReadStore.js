dojo.provide("pion.util.XMLQueryReadStore");

dojo.require("dojox.data.QueryReadStore");
dojo.require("dojox.data.XmlStore");

dojo.declare("pion.util.XMLQueryReadStore",
	dojox.data.QueryReadStore,
	{
		//	summary:
		//		Modifies QueryReadStore to handle XML responses.
	
		_className: "pion.util.XMLQueryReadStore",

		rootItem: "",

		preventCache: true,

///////////////////////////////////////////////////////////////////////////////////////////////
// Copied from dojox.data.XmlStore
/* dojo.data.api.Read */

		getValue: function(/* item */ item, /* attribute || attribute-name-string */ attribute, /* value? */ defaultValue){
			//	summary:
			//		Return an attribute value
			//	description:
			//		'item' must be an instance of a dojox.data.XmlItem from the store instance.
			//		If 'attribute' specifies "tagName", the tag name of the element is
			//		returned.
			//		If 'attribute' specifies "childNodes", the first element child is
			//		returned.
			//		If 'attribute' specifies "text()", the value of the first text
			//		child is returned.
			//		For generic attributes, if '_attributeMap' is specified,
			//		an actual attribute name is looked up with the tag name of
			//		the element and 'attribute' (concatenated with '.').
			//		Then, if 'attribute' starts with "@", the value of the XML
			//		attribute is returned.
			//		Otherwise, the first child element of the tag name specified with
			//		'attribute' is returned.
			//	item:
			//		An XML element that holds the attribute
			//	attribute:
			//		A tag name of a child element, An XML attribute name or one of
			// 		special names
			//	defaultValue:
			//		A default value
			//	returns:
			//		An attribute value found, otherwise 'defaultValue'
			var element = item.element;
			if(attribute === "tagName"){
				return element.nodeName;
			}else if (attribute === "childNodes"){
				for (var i = 0; i < element.childNodes.length; i++) {
					var node = element.childNodes[i];
					if (node.nodeType === 1 /*ELEMENT_NODE*/) {
						return this._getItem(node); //object
					}
				}
				return defaultValue;
			}else if(attribute === "text()"){
				for(var i = 0; i < element.childNodes.length; i++){
					var node = element.childNodes[i];
					if(node.nodeType === 3 /*TEXT_NODE*/ ||
						node.nodeType === 4 /*CDATA_SECTION_NODE*/){
						return node.nodeValue; //string
					}
				}
				return defaultValue;
			}else{
				attribute = this._getAttribute(element.nodeName, attribute);
				if(attribute.charAt(0) === '@'){
					var name = attribute.substring(1);
					var value = element.getAttribute(name);
					return (value !== undefined) ? value : defaultValue; //object
				}else{
					for(var i = 0; i < element.childNodes.length; i++){
						var node = element.childNodes[i];
						if(	node.nodeType === 1 /*ELEMENT_NODE*/ &&
							node.nodeName === attribute){
							return this._getItem(node); //object
						}
					}
					return defaultValue; //object
				}
			}
		},
	
		getValues: function(/* item */ item, /* attribute || attribute-name-string */ attribute){
			//	summary:
			//		Return an array of attribute values
			//	description:
			//		'item' must be an instance of a dojox.data.XmlItem from the store instance.
			//		If 'attribute' specifies "tagName", the tag name of the element is
			//		returned.
			//		If 'attribute' specifies "childNodes", child elements are returned.
			//		If 'attribute' specifies "text()", the values of child text nodes
			//		are returned.
			//		For generic attributes, if '_attributeMap' is specified,
			//		an actual attribute name is looked up with the tag name of
			//		the element and 'attribute' (concatenated with '.').
			//		Then, if 'attribute' starts with "@", the value of the XML
			//		attribute is returned.
			//		Otherwise, child elements of the tag name specified with
			//		'attribute' are returned.
			//	item:
			//		An XML element that holds the attribute
			//	attribute:
			//		A tag name of child elements, An XML attribute name or one of
			//		special names
			//	returns:
			//		An array of attribute values found, otherwise an empty array
			var element = item.element;
			if(attribute === "tagName"){
				return [element.nodeName];
			}else if(attribute === "childNodes"){
				var values = [];
				for(var i = 0; i < element.childNodes.length; i++){
					var node = element.childNodes[i];
					if(node.nodeType === 1 /*ELEMENT_NODE*/){
						values.push(this._getItem(node));
					}
				}
				return values; //array
			}else if(attribute === "text()"){
				var values = [], ec=element.childNodes;
				for(var i = 0; i < ec.length; i++){
					var node = ec[i];
					if(node.nodeType === 3 || node.nodeType === 4){
						values.push(node.nodeValue);
					}
				}
				return values; //array
			}else{
				attribute = this._getAttribute(element.nodeName, attribute);
				if(attribute.charAt(0) === '@'){
					var name = attribute.substring(1);
					var value = element.getAttribute(name);
					return (value !== undefined) ? [value] : []; //array
				}else{
					var values = [];
					for(var i = 0; i < element.childNodes.length; i++){
						var node = element.childNodes[i];
						if(	node.nodeType === 1 /*ELEMENT_NODE*/ &&
							node.nodeName === attribute){
							values.push(this._getItem(node));
						}
					}
					return values; //array
				}
			}
		},
	
		getAttributes: function(/* item */ item) {
			//	summary:
			//		Return an array of attribute names
			// 	description:
			//		'item' must be an instance of a dojox.data.XmlItem from the store instance.
			//		tag names of child elements and XML attribute names of attributes
			//		specified to the element are returned along with special attribute
			//		names applicable to the element including "tagName", "childNodes"
			//		if the element has child elements, "text()" if the element has
			//		child text nodes, and attribute names in '_attributeMap' that match
			//		the tag name of the element.
			//	item:
			//		An XML element
			//	returns:
			//		An array of attributes found
			var element = item.element;
			var attributes = [];
			attributes.push("tagName");
			if(element.childNodes.length > 0){
				var names = {};
				var childNodes = true;
				var text = false;
				for(var i = 0; i < element.childNodes.length; i++){
					var node = element.childNodes[i];
					if (node.nodeType === 1 /*ELEMENT_NODE*/) {
						var name = node.nodeName;
						if(!names[name]){
							attributes.push(name);
							names[name] = name;
						}
						childNodes = true;
					}else if(node.nodeType === 3){
						text = true;
					}
				}
				if(childNodes){
					attributes.push("childNodes");
				}
				if(text){
					attributes.push("text()");
				}
			}
			for(var i = 0; i < element.attributes.length; i++){
				attributes.push("@" + element.attributes[i].nodeName);
			}
			if(this._attributeMap){
				for (var key in this._attributeMap){
					var i = key.indexOf('.');
					if(i > 0){
						var tagName = key.substring(0, i);
						if (tagName === element.nodeName){
							attributes.push(key.substring(i + 1));
						}
					}else{ // global attribute
						attributes.push(key);
					}
				}
			}
			return attributes; //array
		},
	
		hasAttribute: function(/* item */ item, /* attribute || attribute-name-string */ attribute){
			//	summary:
			//		Check whether an element has the attribute
			//	item:
			//		'item' must be an instance of a dojox.data.XmlItem from the store instance.
			//	attribute:
			//		A tag name of a child element, An XML attribute name or one of
			//		special names
			//	returns:
			//		True if the element has the attribute, otherwise false
			return (this.getValue(item, attribute) !== undefined); //boolean
		},
	
		containsValue: function(/* item */ item, /* attribute || attribute-name-string */ attribute, /* anything */ value){
			//	summary:
			//		Check whether the attribute values contain the value
			//	item:
			//		'item' must be an instance of a dojox.data.XmlItem from the store instance.
			//	attribute:
			//		A tag name of a child element, An XML attribute name or one of
			//		special names
			//	returns:
			//		True if the attribute values contain the value, otherwise false
			var values = this.getValues(item, attribute);
			for(var i = 0; i < values.length; i++){
				if((typeof value === "string")){
					if(values[i].toString && values[i].toString() === value){
						return true;
					}
				}else if (values[i] === value){
					return true; //boolean
				}
			}
			return false;//boolean
		},
	
		isItem: function(/* anything */ something){
			//	summary:
			//		Check whether the object is an item (XML element)
			//	item:
			//		An object to check
			// 	returns:
			//		True if the object is an XML element, otherwise false
			if(something && something.element && something.store && something.store === this){
				return true; //boolean
			}
			return false; //boolran
		},
///////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////
// Copied from dojox.data.XmlStore
/* internal API */

		_getAttribute: function(tagName, attribute){
			if(this._attributeMap){
				var key = tagName + "." + attribute;
				var value = this._attributeMap[key];
				if(value){
					attribute = value;
				}else{ // look for global attribute
					value = this._attributeMap[attribute];
					if(value){
						attribute = value;
					}
				}
			}
			return attribute; //object
		},

		_getItem: function(element){
			return new dojox.data.XmlItem(element, this); //object
		},
///////////////////////////////////////////////////////////////////////////////////////////////
// Copied from QueryReadStore._xhrFetchHandler() and modified to handle XML.
		_xhrFetchHandler: function(data, request, fetchHandler, errorHandler){
			data = this._filterResponse(data);

			///////////////////////////////////////////////////////////////////////////////////////////////
			// Extracted from dojox.data.XmlStore._getItems()

			var items = [];
			var nodes = null;	
			if (this.rootItem !== "") {
				nodes = data.getElementsByTagName(this.rootItem);
			} else {
				nodes = data.documentElement.childNodes;
			}
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				if(node.nodeType != 1 /*ELEMENT_NODE*/){
					continue;
				}
				var item = this._getItem(node);
				items.push(item);
			}
			dojo.forEach(items, function(item) { 
				item.element.parentNode.removeChild(item.element); // make it root
			}, this);

			//
			///////////////////////////////////////////////////////////////////////////////////////////////

			nodes = data.getElementsByTagName('TotalRows');
			var numRows = -1;
			if (nodes.length > 0) numRows = parseInt(dojo.isIE? nodes[0].childNodes[0].nodeValue : nodes[0].textContent);

			this._items = [];
			// Store a ref to "this" in each item, so we can simply check if an item
			// really origins form here (idea is from ItemFileReadStore, I just don't know
			// how efficient the real storage use, garbage collection effort, etc. is).
			dojo.forEach(items, function(e) { 
				this._items.push({i: e, r: this}); 
			}, this); 
			
			var identifier = data.identifier;
			this._itemsByIdentity = {};
			if(identifier){
				this._identifier = identifier;
				var i;
				for(i = 0; i < this._items.length; ++i){
					var item = this._items[i].i;
					var identity = item[identifier];
					if(!this._itemsByIdentity[identity]){
						this._itemsByIdentity[identity] = item;
					}else{
						throw new Error(this._className+":  The json data as specified by: [" + this.url + "] is malformed.  Items within the list have identifier: [" + identifier + "].  Value collided: [" + identity + "]");
					}
				}
			}else{
				this._identifier = Number;
				for(i = 0; i < this._items.length; ++i){
					this._items[i].n = i;
				}
			}
			
			// TODO actually we should do the same as dojo.data.ItemFileReadStore._getItemsFromLoadedData() to sanitize
			// (does it really sanititze them) and store the data optimal. should we? for security reasons???
			numRows = this._numRows = (numRows === -1) ? this._items.length : numRows;

			fetchHandler(items, request, numRows);

			this._numRows = numRows;		
		},
///////////////////////////////////////////////////////////////////////////////////////////////
// Copied from dojox.data.QueryReadStore._fetchItems() and modified to handle XML.
		_fetchItems: function(request, fetchHandler, errorHandler){
			//	summary:
			// 		The request contains the data as defined in the Read-API.
			// 		Additionally there is following keyword "serverQuery".
			//
			//	The *serverQuery* parameter, optional.
			//		This parameter contains the data that will be sent to the server.
			//		If this parameter is not given the parameter "query"'s
			//		data are sent to the server. This is done for some reasons:
			//		- to specify explicitly which data are sent to the server, they
			//		  might also be a mix of what is contained in "query", "queryOptions"
			//		  and the paging parameters "start" and "count" or may be even
			//		  completely different things.
			//		- don't modify the request.query data, so the interface using this
			//		  store can rely on unmodified data, as the combobox dijit currently
			//		  does it, it compares if the query has changed
			//		- request.query is required by the Read-API
			//
			// 		I.e. the following examples might be sent via GET:
			//		  fetch({query:{name:"abc"}, queryOptions:{ignoreCase:true}})
			//		  the URL will become:   /url.php?name=abc
			//
			//		  fetch({serverQuery:{q:"abc", c:true}, query:{name:"abc"}, queryOptions:{ignoreCase:true}})
			//		  the URL will become:   /url.php?q=abc&c=true
			//		  // The serverQuery-parameter has overruled the query-parameter
			//		  // but the query parameter stays untouched, but is not sent to the server!
			//		  // The serverQuery contains more data than the query, so they might differ!
			//
	
			if (this.sortRequiresNewRequest && request.sort) { // Client needs to generate a new request.
				return;
			}
			var serverQuery = request.serverQuery || request.query || {};
			//Need to add start and count
			if(!this.doClientPaging){
				serverQuery.start = request.start || 0;
				// Count might not be sent if not given.
				if (request.count) {
					serverQuery.count = request.count;
				}
			}
			if(!this.doClientSorting){
				if(request.sort){
					var sort = request.sort[0];
					if(sort && sort.attribute){
						var sortStr = sort.attribute;
						if(sort.descending){
							sortStr = "-" + sortStr;
						}
						serverQuery.sort = sortStr;
					}
				}
			}

			// For MonitorService we want doClientPaging = true, because we don't want start and count parameters in the query.
			// However, we don't want queries to be cached.  So, until such time as we have a situation where we do want query
			// cacheing, we'll override it with DO_NO_CACHEING.
			var DO_NO_CACHEING = true;

			// Compare the last query and the current query by simply json-encoding them,
			// so we dont have to do any deep object compare ... is there some dojo.areObjectsEqual()???
			if (! DO_NO_CACHEING && this.doClientPaging && this._lastServerQuery!==null &&
				dojo.toJson(serverQuery)==dojo.toJson(this._lastServerQuery)
				){
				this._numRows = (this._numRows === -1) ? this._items.length : this._numRows;
				fetchHandler(this._items, request, this._numRows);
			}else{
				var xhrFunc = this.requestMethod.toLowerCase()=="post" ? dojo.xhrPost : dojo.xhrGet;
				var xhrHandler = xhrFunc({url: this.url, handleAs: "xml", content: serverQuery, timeout: 20000, preventCache: this.preventCache});
				xhrHandler.addCallback(dojo.hitch(this, function(data){
					this._xhrFetchHandler(data, request, fetchHandler, errorHandler);
				}));
				xhrHandler.addErrback(function(error){
					errorHandler(error, request);
				});
				// Generate the hash using the time in milliseconds and a randon number.
				// Since Math.randon() returns something like: 0.23453463, we just remove the "0."
				// probably just for esthetic reasons :-).
				this.lastRequestHash = new Date().getTime()+"-"+String(Math.random()).substring(2);
				this._lastServerQuery = dojo.mixin({}, serverQuery);
			}
		}
///////////////////////////////////////////////////////////////////////////////////////////////
	}
);
