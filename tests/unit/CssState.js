define([
	"intern!object",
	"intern/chai!assert",
	"dojo/dom-class",
	"delite/register",
	"delite/CssState"
], function (registerSuite, assert, domClass, register, CssState) {
	registerSuite({
		name: "CssState",
		"basic" : function () {
			// Workaround problem using dcl() on native DOMNodes on FF and IE,
			// see https://github.com/uhop/dcl/issues/9.
			// After that's fixed, this should be a single register() statement.
			var CssWidgetMixin = register.dcl(CssState, {
				state: "",
				disabled: false,
				checked: false
			});
			var CssWidget = register("css-widget", [HTMLElement, CssWidgetMixin], { });

			var widget = new CssWidget({
				state: "error",
				disabled: true,
				checked: true
			});

			assert.ok(domClass.contains(widget, "d-error"), "error state");
			assert.ok(domClass.contains(widget, "d-disabled"), "disabled");
			assert.ok(domClass.contains(widget, "d-checked"), "checked");

			widget.mix({
				state: "incomplete",
				disabled: false,
				checked: "mixed"
			});

			assert.ok(!domClass.contains(widget, "d-error"), "not error state");
			assert.ok(domClass.contains(widget, "d-incomplete"), "incomplete state");
			assert.ok(!domClass.contains(widget, "d-disabled"), "not disabled");
			assert.ok(domClass.contains(widget, "d-mixed"), "half checked");
			assert.ok(!domClass.contains(widget, "d-checked"), "original checked removed");
		}
	});
});
