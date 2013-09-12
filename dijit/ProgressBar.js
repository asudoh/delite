define([
	"require", // require.toUrl
	"dojo/_base/declare", // declare
	"dojo/dom-class", // domClass.toggle
	"dojo/_base/lang", // lang.mixin
	"dojo/number", // number.format
	"../_WidgetBase",
	"../_TemplatedMixin",
	"dojo/text!./templates/ProgressBar.html"
], function(require, declare, domClass, lang, number, _WidgetBase, _TemplatedMixin, template){

	// module:
	//		dui/ProgressBar

	return declare("dui.ProgressBar", [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		A progress indication widget, showing the amount completed
		//		(often the percentage completed) of a task.

		// value: String (Percentage or Number)
		//		Number or percentage indicating amount of task completed.
		//		With "%": percentage value, 0% <= progress <= 100%, or
		//		without "%": absolute value, 0 <= progress <= maximum.
		//		Infinity means that the progress bar is indeterminate.
		value: "",

		// maximum: [const] Float
		//		Max sample number
		maximum: 100,

		// places: [const] Number
		//		Number of places to show in values; 0 by default
		places: 0,

		// label: String?
		//		HTML label on progress bar.   Defaults to percentage for determinate progress bar and
		//		blank for indeterminate progress bar.
		label: "",

		// name: String
		//		this is the field name (for a form) if set. This needs to be set if you want to use
		//		this widget in a dui/form/Form widget (such as dui/Dialog)
		name: '',

		templateString: template,

		// _indeterminateHighContrastImagePath: [private] URL
		//		URL to image to use for indeterminate progress bar when display is in high contrast mode
		_indeterminateHighContrastImagePath: require.toUrl("./themes/a11y/indeterminate_progress.gif"),

		buildRendering: function(){
			this.inherited(arguments);
			this.indeterminateHighContrastImage.setAttribute("src",
				this._indeterminateHighContrastImagePath.toString());
			this.update();
		},

		_setDirAttr: function(val){
			// Normally _CssStateMixin takes care of this, but we aren't extending it
			domClass.toggle(this.domNode, "duiProgressBarRtl", val == "rtl");
			this.inherited(arguments);
		},

		update: function(/*Object?*/attributes){
			// summary:
			//		Internal method to change attributes of ProgressBar, similar to set(hash).  Users should call
			//		set("value", ...) rather than calling this method directly.
			// attributes:
			//		May provide progress and/or maximum properties on this parameter;
			//		see attribute specs for details.
			// example:
			//	|	myProgressBar.update({'indeterminate': true});
			//	|	myProgressBar.update({'progress': 80});
			//	|	myProgressBar.update({'indeterminate': true, label:"Loading ..." })
			// tags:
			//		private

			// TODO: deprecate this method and use set() instead

			lang.mixin(this, attributes || {});
			var tip = this.internalProgress, ap = this.domNode;
			var percent = 1;
			if(this.indeterminate){
				ap.removeAttribute("aria-valuenow");
			}else{
				if(String(this.progress).indexOf("%") != -1){
					percent = Math.min(parseFloat(this.progress) / 100, 1);
					this.progress = percent * this.maximum;
				}else{
					this.progress = Math.min(this.progress, this.maximum);
					percent = this.maximum ? this.progress / this.maximum : 0;
				}
				ap.setAttribute("aria-valuenow", this.progress);
			}

			// Even indeterminate ProgressBars should have these attributes
			ap.setAttribute("aria-labelledby", this.labelNode.id);
			ap.setAttribute("aria-valuemin", 0);
			ap.setAttribute("aria-valuemax", this.maximum);

			this.labelNode.innerHTML = this.report(percent);

			domClass.toggle(this.domNode, "duiProgressBarIndeterminate", this.indeterminate);
			tip.style.width = (percent * 100) + "%";
			this.onChange();
		},

		_setValueAttr: function(v){
			this._set("value", v);
			if(v == Infinity){
				this.update({indeterminate: true});
			}else{
				this.update({indeterminate: false, progress: v});
			}
		},

		_setLabelAttr: function(label){
			this._set("label", label);
			this.update();
		},

		report: function(/*float*/percent){
			// summary:
			//		Generates HTML message to show inside progress bar (normally indicating amount of task completed).
			//		May be overridden.
			// tags:
			//		extension

			return this.label ? this.label :
				(this.indeterminate ? "&#160;" : number.format(percent, { type: "percent", places: this.places, locale: this.lang }));
		},

		onChange: function(){
			// summary:
			//		Callback fired when progress updates.
			// tags:
			//		extension
		}
	});
});