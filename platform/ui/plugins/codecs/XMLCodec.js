dojo.provide("plugins.codecs.XMLCodec");
dojo.require("plugins.codecs.Codec");
dojo.require("pion.widgets.TermTextBox");

dojo.declare("plugins.codecs.XMLCodecPane",
	[ plugins.codecs.CodecPane ],
	{
		templatePath: dojo.moduleUrl("plugins", "codecs/XMLCodec/XMLCodecPane.html"),
		postMixInProperties: function() {
			this.inherited('postMixInProperties', arguments);
			if (this.templatePath) this.templateString = "";
		},
		widgetsInTemplate: true,
		postCreate: function() {
			this.inherited("postCreate", arguments);
			this.form.attr('value', {EventTag: 'Event', EventContainerTag: 'Events'});
		},
 		getHeight: function() {
			// TODO: replace 540 with some computed value
			return 540;
		}
	}
);
