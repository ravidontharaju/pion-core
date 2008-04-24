dojo.provide("pion.terms");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojox.data.XmlStore");

pion.terms.store = new dojox.data.XmlStore({url: '/config/terms', rootItem: 'Term', attributeMap: {'Term.id': '@id'}});

// fetchItemByIdentity and getIdentity are needed for FilteringSelect.
pion.terms.store.fetchItemByIdentity = function(keywordArgs) {
	pion.terms.store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem});
}
pion.terms.store.getIdentity = function(item) {
	return pion.terms.store.getValue(item, '@id');
}

pion.terms.categories_by_id = {};

pion.terms.type_store = new dojo.data.ItemFileReadStore({url: '/resources/termTypes.json'});
pion.terms.types_by_description = {};
pion.terms.type_descriptions_by_name = {};

pion.terms.init = function() {
	pion.terms.store.fetch({
		onItem: function(item) {
			var type = pion.terms.store.getValue(item, 'Type').toString();
			var id   = pion.terms.store.getIdentity(item);
			console.debug('type = ', type, ', id = ', id);
			pion.terms.type_store.fetch({
				query: {name: type},
				onItem: function(item) {
					pion.terms.categories_by_id[id] = pion.terms.type_store.getValue(item, 'category');
				}
			});
		}
	});
}

pion.terms.initDescriptionLookups = function() {
	var store = pion.terms.type_store;
	store.fetch({
		onItem: function(item, request) {
			pion.terms.types_by_description[store.getValue(item, 'description')] = store.getValue(item, 'name');
			pion.terms.type_descriptions_by_name[store.getValue(item, 'name')] = store.getValue(item, 'description');
		}
	});
}
