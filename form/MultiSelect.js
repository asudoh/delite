define([
	"dojo/_base/declare", // declare
	"dojo/dom-geometry", // domGeometry.setMarginBox
	"dojo/has",
	"dojo/query", // query
	"../FormValueWidget"
], function(declare, domGeometry, has, query, FormValueWidget){

	// module:
	//		dui/form/MultiSelect

	var MultiSelect = declare("dui.form.MultiSelect" + (has("dojo-bidi") ? "_NoBidi" : ""), FormValueWidget, {
		// summary:
		//		Widget version of a `<select multiple=true>` element,
		//		for selecting multiple options.

		// size: Number
		//		Number of elements to display on a page
		//		NOTE: may be removed in version 2.0, since elements may have variable height;
		//		set the size via style="..." or CSS class names instead.
		size: 7,

		baseClass: "duiMultiSelect",

		templateString: "<select multiple='true' data-dojo-attach-point='containerNode,focusNode' data-dojo-attach-event='onchange: _onChange'></select>",

		addSelected: function(/*dui/form/MultiSelect*/ select){
			// summary:
			//		Move the selected nodes of a passed Select widget
			//		instance to this Select widget.
			//
			// example:
			// |	// move all the selected values from "bar" to "foo"
			// |	dui.byId("foo").addSelected(dui.byId("bar"));

			select.getSelected().forEach(function(n){
				this.containerNode.appendChild(n);
				// scroll to bottom to see item
				// cannot use scrollIntoView since <option> tags don't support all attributes
				// does not work on IE due to a bug where <select> always shows scrollTop = 0
				this.domNode.scrollTop = this.domNode.offsetHeight; // overshoot will be ignored
				// scrolling the source select is trickier esp. on safari who forgets to change the scrollbar size
				var oldscroll = select.domNode.scrollTop;
				select.domNode.scrollTop = 0;
				select.domNode.scrollTop = oldscroll;
			}, this);
			this._set('value', this.get('value'));
		},

		getSelected: function(){
			// summary:
			//		Access the NodeList of the selected options directly
			return query("option", this.containerNode).filter(function(n){
				return n.selected; // Boolean
			}); // dojo/NodeList
		},

		_getValueAttr: function(){
			// summary:
			//		Hook so get('value') works.
			// description:
			//		Returns an array of the selected options' values.

			// Don't call getSelect.map() because it doesn't return a real array,
			// and that messes up dojo.toJson() calls like in the Form.html test
			return this.getSelected().map(function(n){
				return n.value;
			});
		},

		multiple: true, // for Form

		_setValueAttr: function(/*Array*/ values, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', values) works.
			// description:
			//		Set the value(s) of this Select based on passed values
			query("option", this.containerNode).forEach(function(n){
				n.selected = (values.indexOf(n.value) != -1);
			});
			this.inherited(arguments);
		},

		invertSelection: function(/*Boolean?*/ onChange){
			// summary:
			//		Invert the selection
			// onChange: Boolean
			//		If false, onChange is not fired.
			var val = [];
			query("option", this.containerNode).forEach(function(n){
				if(!n.selected){
					val.push(n.value);
				}
			});
			this._setValueAttr(val, !(onChange === false || onChange == null));
		},

		_onChange: function(/*Event*/){
			this._handleOnChange(this.get('value'), true);
		},

		// for layout widgets:
		resize: function(/*Object*/ size){
			if(size){
				domGeometry.setMarginBox(this.domNode, size);
			}
		},

		postCreate: function(){
			this._set('value', this.get('value'));
			this.inherited(arguments);
		}
	});

	if(has("dojo-bidi")){
		MultiSelect = declare("dui.form.MultiSelect", MultiSelect, {
			addSelected: function(/*dui/form/MultiSelect*/ select){
				select.getSelected().forEach(function(n){
					n.text = this.enforceTextDirWithUcc(this.restoreOriginalText(n), n.text);
				}, this);
				this.inherited(arguments);
			},

			_setTextDirAttr: function(textDir){
				// to insure the code executed only when _BidiSupport loaded, and only
				// when there was a change in textDir
				if((this.textDir != textDir || !this._created) && this.enforceTextDirWithUcc){
					this._set("textDir", textDir);

					query("option", this.containerNode).forEach(function(option){
						// If the value wasn't defined explicitly, it the same object as
						// option.text. Since the option.text will be modified (by wrapping of UCC)
						// we want to save the original option.value for form submission.
						if(!this._created && option.value === option.text){
							option.value = option.text;
						}
						// apply the bidi support
						option.text = this.enforceTextDirWithUcc(option, option.originalText || option.text);
					}, this);
				}
			}
		});
	}

	return MultiSelect;
});
