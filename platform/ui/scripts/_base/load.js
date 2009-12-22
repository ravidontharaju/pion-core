dojo.provide("pion._base.load");

pion.loadCss = function(href) {
	// (Adapted from createFrame() in dojo/_firebug/firebug.js.)
	var styleElement = document.createElement("link");
	styleElement.href = href;
	styleElement.rel = "stylesheet";
	styleElement.type = "text/css";
	var styleParent = document.getElementsByTagName("head");
	if (styleParent) {
		styleParent = styleParent[0];
	}
	if (!styleParent) {
		styleParent = document.getElementsByTagName("html")[0];
	}
	if (dojo.isIE) {
		window.setTimeout(function(){ styleParent.appendChild(styleElement); }, 0);
	} else {
		styleParent.appendChild(styleElement);
	}
};
