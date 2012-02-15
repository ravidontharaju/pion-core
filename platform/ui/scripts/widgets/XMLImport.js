dojo.provide("pion.widgets.XMLImport");
dojo.require("pion.codecs");
dojo.require("pion.databases");
dojo.require("pion.reactors");
dojo.require("dijit.Dialog");
dojo.require("dojox.data.dom");
dojo.require("dojox.xml.DomParser");

// TODO: this could be a singleton, i.e. pion.widgets.XML_import_dialog
dojo.declare("pion.widgets.XMLImportDialog",
	[ dijit.Dialog ],
	{
		templatePath: dojo.moduleUrl("pion", "widgets/XMLImportDialog.html"),
		widgetsInTemplate: true,
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		postCreate: function() {
			this.inherited("postCreate", arguments);
			var _this = this;

			// See dijit.form.Button._onButtonClick().  'return false' prevents spurious
			// calls to _onSubmit() in IE8, which sets type=submit by default.
			this.buttons.save_button.onClick = function() { _this.applyXML(); return false; };
			this.buttons.save_button.attr('disabled', true);
			this.buttons.cancel_button.onClick = function() { _this.onCancel(); return false; };

			this.uuid_replacements = {};
		},
		enableApply: function() {
			console.debug("enableApply called");
			this.buttons.save_button.attr('disabled', false);
		},
		applyXML: function() {
			console.debug("applyXML called");
			this.buttons.save_button.attr('disabled', true);

			// TODO: check if already PionConfig first

			var wrapped_XML = '<PionConfig>' + this.XML_text_area.value + '</PionConfig>';
			var trimmed_XML = wrapped_XML.replace(/>\s*/g, '>');
			if (dojo.isIE) {
				var XML_configs = dojox.data.dom.createDocument();
				XML_configs.loadXML(trimmed_XML);
			} else {
				var parser = new DOMParser();
				var XML_configs = parser.parseFromString(trimmed_XML, "text/xml");
			}

			// TODO: check that XML_configs.childNodes[0] is PionConfig

			var configs = XML_configs.childNodes[0].childNodes;
			this.result_text_area.value += configs.length + ' configurations found.\n';
			this.configs_by_type = {
				//Vocabulary: [],
				Codec: [],
				Database: [],
				//User: [],
				Reactor: [],
				Connection: []
			};
			for (var i = 0; i < configs.length; ++i) {
				var type = configs[i].nodeName;
				if (!this.configs_by_type[type]) {
					this.result_text_area.value += 'Error: unknown configuration type "' + type + '".\n';
					return;
				}
				this.configs_by_type[type].push(configs[i]);
			}
			this.processCodecs();
		},
		processCodecs: function() {
			if (this.configs_by_type.Codec.length == 0) {
				this.result_text_area.value += 'No Codec configurations found.\n';
				this.processDatabases();
			} else {
				this.result_text_area.value += this.configs_by_type.Codec.length + ' Codec configurations found.\n';
				var num_codecs_added = 0;
				var _this = this;
				dojo.forEach(this.configs_by_type.Codec, function(codec_node) {
					var old_codec_id = codec_node.getAttribute('id');
					var post_data = '<PionConfig>' + dojox.data.dom.innerXML(codec_node) + '</PionConfig>';
					dojo.rawXhrPost({
						url: '/config/codecs',
						contentType: "text/xml",
						handleAs: "xml",
						postData: post_data,
						load: function(response){
							var node = response.getElementsByTagName('Codec')[0];
							var new_id = node.getAttribute('id');
							if (old_codec_id) {
								_this.uuid_replacements[old_codec_id] = new_id;
							}
							if (codec_config_page_initialized) {
								pion.codecs.createNewPaneFromStore(new_id, false);
							}
							var name = node.getElementsByTagName('Name')[0].childNodes[0].nodeValue;
							_this.result_text_area.value += 'Codec named "' + name + '" added with new UUID ' + new_id + '\n';
	
							// If all Codecs have been added, proceed to Databases.
							if (++num_codecs_added == _this.configs_by_type.Codec.length) {
								_this.processDatabases();
							}
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				});
			}
		},
		processDatabases: function() {
			if (this.configs_by_type.Database.length == 0) {
				this.result_text_area.value += 'No Database configurations found.\n';
				this.processReactors();
			} else {
				this.result_text_area.value += this.configs_by_type.Database.length + ' Database configurations found.\n';
				var num_databases_added = 0;
				var _this = this;
				dojo.forEach(this.configs_by_type.Database, function(database_node) {
					var old_database_id = database_node.getAttribute('id');
					var post_data = '<PionConfig>' + dojox.data.dom.innerXML(database_node) + '</PionConfig>';
					dojo.rawXhrPost({
						url: '/config/databases',
						contentType: "text/xml",
						handleAs: "xml",
						postData: post_data,
						load: function(response){
							var node = response.getElementsByTagName('Database')[0];
							var new_id = node.getAttribute('id');
							if (old_database_id) {
								_this.uuid_replacements[old_database_id] = new_id;
							}
							if (database_config_page_initialized) {
								pion.databases.createNewPaneFromStore(new_id, false);
							}
							var name = node.getElementsByTagName('Name')[0].childNodes[0].nodeValue;
							_this.result_text_area.value += 'Database named "' + name + '" added with new UUID ' + new_id + '\n';
	
							// If all Databases have been added, proceed to Reactors.
							if (++num_databases_added == _this.configs_by_type.Database.length) {
								_this.processReactors();
							}
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				});
			}
		},
		processReactors: function() {
			if (this.configs_by_type.Reactor.length == 0) {
				this.result_text_area.value += 'No Reactor configurations found.\n';
				console.debug('this.uuid_replacements = ', this.uuid_replacements);

				// TODO: Do we even want to allow adding Connections if no Reactors were added? 
				this.processConnections();
			} else {
				// Necessary to work right with pion-dojo.js in IE7.
				dijit.byId('main_stack_container').selectChild(dijit.byId("reactor_config"));

				this.result_text_area.value += this.configs_by_type.Reactor.length + ' Reactor configurations found.\n';
				var num_reactors_added = 0;
				var _this = this;
				dojo.forEach(this.configs_by_type.Reactor, function(reactor_node) {
					// TODO: if no workspace is specified, make the user choose one.
	
					var old_reactor_id = reactor_node.getAttribute('id');
					var post_data = '<PionConfig>' + dojox.data.dom.innerXML(reactor_node) + '</PionConfig>';
					for (var old_id in _this.uuid_replacements) {
						post_data = post_data.replace(RegExp(old_id, "g"), _this.uuid_replacements[old_id]);
					}
					console.debug('post_data = ', post_data);
					dojo.rawXhrPost({
						url: '/config/reactors',
						contentType: "text/xml",
						handleAs: "xml",
						postData: post_data,
						load: function(response) {
							var node = response.getElementsByTagName('Reactor')[0];
							var new_id = node.getAttribute('id');
							if (old_reactor_id) {
								_this.uuid_replacements[old_reactor_id] = new_id;
							}

							var config = { '@id': new_id };
							var attribute_nodes = node.childNodes;
							for (var i = 0; i < attribute_nodes.length; ++i) {
								if (attribute_nodes[i].firstChild) {
									config[attribute_nodes[i].tagName] = attribute_nodes[i].firstChild.nodeValue;
								}
							}
							pion.reactors.createReactorInConfiguredWorkspace(config);
							_this.result_text_area.value += 'Reactor named "' + config.Name + '" added with new UUID ' + new_id + '\n';

							if (++num_reactors_added == _this.configs_by_type.Reactor.length) {
								// Need to wait until all Reactors have been added before switching back.
								dijit.byId('main_stack_container').selectChild(dijit.byId("system_config"));

								console.debug('this.uuid_replacements = ', this.uuid_replacements);
								pion.reactors.updateRunButtons();
								_this.processConnections();
							}
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				});
			}
		},
		processConnections: function() {
			if (this.configs_by_type.Connection.length == 0) {
				this.result_text_area.value += 'No Connection configurations found.\n';
			} else {
				// Necessary for Connections to be visible.
				dijit.byId('main_stack_container').selectChild(dijit.byId("reactor_config"));

				this.result_text_area.value += this.configs_by_type.Connection.length + ' Connections found.\n';
				var num_connections_added = 0;
				var _this = this;
				dojo.forEach(this.configs_by_type.Connection, function(connection_node) {
					var old_connection_id = connection_node.getAttribute('id');
					var post_data = '<PionConfig>' + dojox.data.dom.innerXML(connection_node) + '</PionConfig>';
					for (var old_id in _this.uuid_replacements) {
						post_data = post_data.replace(RegExp(old_id, "g"), _this.uuid_replacements[old_id]);
					}
					console.debug('post_data = ', post_data);
					dojo.rawXhrPost({
						url: '/config/connections',
						contentType: "text/xml",
						handleAs: "xml",
						postData: post_data,
						load: function(response) {
							var node = response.getElementsByTagName('Connection')[0];
							var new_id = node.getAttribute('id');	
							var from_id = response.getElementsByTagName('From')[0].firstChild.nodeValue;
							var to_id   = response.getElementsByTagName('To')[0].firstChild.nodeValue;
							pion.reactors.createConnection(from_id, to_id, new_id);
							_this.result_text_area.value += 'Connection from ' + from_id + ' to ' + to_id + ' added with new UUID ' + new_id + '\n';
							if (++num_connections_added == _this.configs_by_type.Connection.length) {
								// Need to wait until all Connections have been drawn before switching back.
								dijit.byId('main_stack_container').selectChild(dijit.byId("system_config"));
							}
						},
						error: pion.getXhrErrorHandler(dojo.rawXhrPost, {postData: post_data})
					});
				});
			}
		}
	}
);
