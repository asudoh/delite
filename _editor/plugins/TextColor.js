define([
	"dojo/_base/connect", // connect.subscribe
	"dojo/colors", // colors.fromRgb
	"dojo/_base/declare", // declare
	"../_Plugin",
	"../../form/DropDownButton",
	"../../ColorPalette",
	"../.."	// dijit._scopeName
], function(connect, colors, declare, _Plugin, DropDownButton, ColorPalette, dijit){

/*=====
	var _Plugin = dijit._editor._Plugin;
=====*/

// module:
//		dijit/_editor/plugins/TextColor
// summary:
//		This plugin provides dropdown color pickers for setting text color and background color


var TextColor = declare("dijit._editor.plugins.TextColor", _Plugin, {
	// summary:
	//		This plugin provides dropdown color pickers for setting text color and background color
	//
	// description:
	//		The commands provided by this plugin are:
	//		* foreColor - sets the text color
	//		* hiliteColor - sets the background color

	// Override _Plugin.buttonClass to use DropDownButton (with ColorPalette) to control this plugin
	buttonClass: DropDownButton,

	// useDefaultCommand: Boolean
	//		False as we do not use the default editor command/click behavior.
	useDefaultCommand: false,

	constructor: function(){
		this.dropDown = new ColorPalette();
		this.connect(this.dropDown, "onChange", function(color){
			this.editor.execCommand(this.command, color);

		});
	},

	updateState: function(){
		// summary:
		//		Overrides _Plugin.updateState().  This updates the ColorPalette
		//		to show the color of the currently selected text.
		// tags:
		//		protected

		var _e = this.editor;
		var _c = this.command;
		if(!_e || !_e.isLoaded || !_c.length){
			return;
		}

		if(this.button){
			var disabled = this.get("disabled");
			this.button.set("disabled", disabled);
			if(disabled){ return; }

			var value;
			try{
				value = _e.queryCommandValue(_c)|| "";
			}catch(e){
				//Firefox may throw error above if the editor is just loaded, ignore it
				value = "";
			}
		}

		if(value == ""){
			value = "#000000";
		}
		if(value == "transparent"){
			value = "#ffffff";
		}

		if(typeof value == "string"){
			//if RGB value, convert to hex value
			if(value.indexOf("rgb")> -1){
				value = colors.fromRgb(value).toHex();
			}
		}else{	//it's an integer(IE returns an MS access #)
			value =((value & 0x0000ff)<< 16)|(value & 0x00ff00)|((value & 0xff0000)>>> 16);
			value = value.toString(16);
			value = "#000000".slice(0, 7 - value.length)+ value;

		}

		if(value !== this.dropDown.get('value')){
			this.dropDown.set('value', value, false);
		}
	}
});

// Register this plugin.
connect.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function(o){
	if(o.plugin){
		return;
	}
	switch(o.args.name){
		case "foreColor":
		case "hiliteColor":
			o.plugin = new TextColor({
				command: o.args.name
			});
	}
});


return TextColor;
});