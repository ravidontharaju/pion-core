dojo.provide("pion.terms");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojox.data.XmlStore");

pion.terms.store = new dojox.data.XmlStore({url: '/config/terms', rootItem: 'Term', attributeMap: {'Term.id': '@id'}});

// fetchItemByIdentity and getIdentity are needed for dijit.form.FilteringSelect and pion.widgets.SimpleSelect.
pion.terms.store.fetchItemByIdentity = function(keywordArgs) {
	pion.terms.store.fetch({query: {'@id': keywordArgs.identity}, onItem: keywordArgs.onItem, onError: pion.handleFetchError});
}
pion.terms.store.getIdentity = function(item) {
	return pion.terms.store.getValue(item, '@id');
}

pion.terms.type_store = new dojo.data.ItemFileReadStore({url: '/resources/termTypes.json'});

pion.terms.init = function() {
	pion.terms.initTermTypeLookups();
}

pion.terms.initTermTypeLookups = function() {
	pion.terms.types_by_description = {};
	pion.terms.type_descriptions_by_name = {};
	pion.terms.categories_by_type = {};
	var store = pion.terms.type_store;
	store.fetch({
		onItem: function(item, request) {
			pion.terms.types_by_description[store.getValue(item, 'description')] = store.getValue(item, 'name');
			pion.terms.type_descriptions_by_name[store.getValue(item, 'name')] = store.getValue(item, 'description');
			pion.terms.categories_by_type[store.getValue(item, 'name')] = store.getValue(item, 'category');
		},
		onComplete: pion.terms.buildMapOfCategoriesByTerm,
		onError: pion.handleFetchError
	});
}

pion.terms.buildMapOfCategoriesByTerm = function() {
	pion.terms.types_by_id = {};
	pion.terms.categories_by_id = {};
	pion.terms.term_comments_by_id = {};
	pion.terms.store.fetch({
		onItem: function(item) {
			var type = pion.terms.store.getValue(item, 'Type').toString();
			var id   = pion.terms.store.getIdentity(item);
			//console.debug('type = ', type, ', id = ', id);
			pion.terms.types_by_id[id] = pion.terms.type_descriptions_by_name[type];
			pion.terms.categories_by_id[id] = pion.terms.categories_by_type[type];
			if (pion.terms.store.hasAttribute(item, 'Comment')) {
				pion.terms.term_comments_by_id[id] = pion.terms.store.getValue(item, 'Comment');
			}
		},
		onError: pion.handleFetchError
	});
}
