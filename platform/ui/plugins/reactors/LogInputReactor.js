dojo.provide("plugins.reactors.LogInputReactor");
dojo.require("plugins.reactors.Reactor");

dojo.declare("plugins.reactors.LogInputReactor",
	[ plugins.reactors.Reactor ],
	{
		postCreate: function(){
			this.config.Plugin = 'LogInputReactor';
			//console.debug('LogInputReactor.postCreate: ', this.domNode);
			this.inherited("postCreate", arguments); 
			this._updateCustomData();
		},
		_updateCustomData: function() {
			this._initOptions(this.config, plugins.reactors.LogInputReactor.option_defaults);
		}
	}
);

plugins.reactors.LogInputReactor.label = 'Log File Input Reactor';

dojo.declare("plugins.reactors.LogInputReactorInitDialog",
	[ plugins.reactors.ReactorInitDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "collection/LogInputReactor/LogInputReactorInitDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.plugin = 'LogInputReactor';
			console.debug('plugins.reactors.LogInputReactorInitDialog.postCreate');
			this.inherited("postCreate", arguments);
		},
		_insertCustomData: function(dialogFields) {
			for (var option in plugins.reactors.LogInputReactor.option_defaults) {
				this.post_data += '<' + option + '>';
				this.post_data += (dojo.indexOf(dialogFields.options, option) != -1); // 'true' iff corresponding checkbox was checked
				this.post_data += '</' + option + '>';
			}
		}
	}
);

dojo.declare("plugins.reactors.LogInputReactorDialog",
	[ plugins.reactors.ReactorDialog ],
	{
		templatePath: dojo.moduleUrl("plugins.reactors", "collection/LogInputReactor/LogInputReactorDialog.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function(){
			this.inherited("postCreate", arguments);
		},
		_insertCustomData: function(dialogFields) {
			for (var option in plugins.reactors.LogInputReactor.option_defaults) {
				this.put_data += '<' + option + '>';
				this.put_data += (dojo.indexOf(dialogFields.options, option) != -1); // 'true' iff corresponding checkbox was checked
				this.put_data += '</' + option + '>';
			}
		}
	}
);

plugins.reactors.LogInputReactor.option_defaults = {
	JustOne: false,
	TailF: false
}
