/** @module delite/Observing */
define([
	"dcl/dcl",
	"./Stateful",
	"./Destroyable"
], function (dcl, Stateful, Destroyable) {
	var EMPTY_ARRAY = [];

	return dcl([Stateful, Destroyable], /** @lends module:delite/Invalidating# */{
		_computingProperties: null,

		_renderingProperties: null,

		constructor: dcl.after(function () {
			// If we are not a Widget, setup the listeners at construction time
			this._initializeObserving();
		}),

		buildRendering: dcl.after(function () {
			// If we are on a Widget, listen for any changes to properties after the widget has been rendered,
			// including when declarative properties (ex: iconClass=xyz) are applied.
			this._initializeObserving();
		}),

		_initializeObserving: function () {
			if ((this._computingProperties || EMPTY_ARRAY).length > 0) {
				this.own(this.observe.apply(this, this._computingProperties.concat(this.refreshComputing)));
			}
			if ((this._renderingProperties || EMPTY_ARRAY).length > 0) {
				this.own(this.observe.apply(this, this._renderingProperties.concat(this.refreshRendering)));
			}
		},

		addComputingProperties: function () {
			EMPTY_ARRAY.push.apply(this._computingProperties = this._computingProperties || [], arguments);
		},

		addRenderingProperties: function () {
			EMPTY_ARRAY.push.apply(this._renderingProperties = this._renderingProperties || [], arguments);
		}
	});
});
