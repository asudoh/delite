define([
	"dcl/dcl",
	"dojo/dom-construct", // domConstruct.place
	"./Widget"
], function (dcl, domConstruct, Widget) {

	// module:
	//		delite/Container

	return dcl(Widget, {
		// summary:
		//		Widget that contains a set of widget children.

		buildRendering: dcl.after(function () {
			if (!this.containerNode) {
				// All widgets with descendants must set containerNode.
				this.containerNode = this;
			}
		}),

		addChild: function (/*DOMNode*/ widget, /*int?*/ insertIndex) {
			// summary:
			//		Makes the given widget or DOM node a child of this widget.
			// description:
			//		Inserts specified child widget or DOM node as a child of this widget's
			//		container node, and possibly does other processing (such as layout).

			// I want to just call domConstruct.place(widget, this.containerNode, insertIndex), but the counting
			// is thrown off by text nodes and comment nodes that show up when constructed by markup.
			// In the future consider stripping those nodes on construction, either in the parser or this widget code.
			var refNode = this.containerNode;
			if (insertIndex > 0) {
				// Old-school way to get nth child; dojo.query would be easier but Container was weened from dojo.query
				// in #10087 to minimize download size.  Not sure if that's still and issue with new smaller dojo/query.
				refNode = refNode.firstChild;
				while (insertIndex > 0) {
					if (refNode.nodeType === 1) {
						insertIndex--;
					}
					refNode = refNode.nextSibling;
				}
				if (refNode) {
					insertIndex = "before";
				} else {
					// to support addChild(child, n-1) where there are n children (should add child at end)
					refNode = this.containerNode;
					insertIndex = "last";
				}
			}

			domConstruct.place(widget, refNode, insertIndex);

			// If I've been started but the child widget hasn't been started,
			// start it now.  Make sure to do this after widget has been
			// inserted into the DOM tree, so it can see that it's being controlled by me,
			// so it doesn't try to size itself.
			if (this._started && !widget._started && dcl.isInstanceOf(widget, Widget)) {
				widget.startup();
			}
		},

		removeChild: function (/*Element|int*/ widget) {
			// summary:
			//		Removes the passed widget instance from this widget but does
			//		not destroy it.  You can also pass in an integer indicating
			//		the index within the container to remove (ie, removeChild(5) removes the sixth widget).

			if (typeof widget === "number") {
				widget = this.getChildren()[widget];
			}

			if (widget) {
				var node = widget;
				if (node && node.parentNode) {
					HTMLElement.prototype.removeChild.call(node.parentNode, node); // detach but don't destroy
				}
			}
		},

		hasChildren: function () {
			// summary:
			//		Returns true if widget has child widgets, i.e. if this.containerNode contains widgets.
			return this.getChildren().length > 0;	// Boolean
		},

		getIndexOfChild: function (/*DOMNode*/ child) {
			// summary:
			//		Gets the index of the child in this container or -1 if not found
			return this.getChildren().indexOf(child);	// int
		},

		_getSibling: function (/*Element*/ node, /*String*/ which) {
			// summary:
			//		Returns next or previous sibling of specified node
			// node:
			//		The node
			// which:
			//		Either "next" or "previous"
			// tags:
			//		private
			do {
				node = node[which + "Sibling"];
			} while (node && node.nodeType !== 1);
			return node;	// Element
		},

		getPreviousSibling: function (/*Element*/ node) {
			// summary:
			//		Returns null if this is the first child of the parent,
			//		otherwise returns the next element sibling to the "left".

			return this._getSibling(node, "previous"); // Element
		},

		getNextSibling: function (/*Element*/ node) {
			// summary:
			//		Returns null if this is the last child of the parent,
			//		otherwise returns the next element sibling to the "right".

			return this._getSibling(node, "next"); // Element
		}
	});
});
