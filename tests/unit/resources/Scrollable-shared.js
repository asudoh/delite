define([
	"intern!object",
	"intern/chai!assert",
	"dojo/dom-geometry",
	"dojo/dom-class"
], function (registerSuite, assert, domGeom, domClass) {

	// This object, used by the tests of delite/Scrollable, is reused by
	// the tests of deliteful/ScrollableContainer.

	var shared = {
		// This is to allow the tests of deliteful/ScrollableContainer
		// to modify the class name.
		containerCSSClassName: "test-scrollable-container"
	};
	
	shared.testCases = {
		"Default CSS" : function () {
			var w = document.getElementById("sc1");
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (id='sc1')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (id='sc1')");

			w = document.getElementById("sc2"); // with scrollDirection == "none"
			w.validateRendering();
			assert.equal(w.scrollDirection, "none", "wrong scroll direction for id=sc2!");
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (id='sc2')");
			// when scrollDirection is "none", this CSS class should NOT be present:
			assert.isFalse(domClass.contains(w, "d-scrollable"),
				"Not expecting d-scrollable CSS class! (id='sc2')");

			w = document.getElementById("mysc1");
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (id='mysc1')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (id='mysc1')");
		},

		"CSS class dependency on scrollDirection" : function () {
			var w = document.getElementById("sc1");
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (id='sc1')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (id='sc1')");

			w.scrollDirection = "none";
			w.validateRendering(); // scrollDirection is an invalidating property
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (scrollDirection='none')");
			// when scrollDirection is "none", this CSS class should NOT be present:
			assert.isFalse(domClass.contains(w, "d-scrollable"),
				"Not expecting d-scrollable CSS class! (scrollDirection='none')");

			w.scrollDirection = "vertical"; // set back to "vertical"
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (scrollDirection='vertical')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (scrollDirection='vertical')");

			w.scrollDirection = "horizontal"; // same for "horizontal"
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (scrollDirection='horizontal')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (scrollDirection='horizontal')");

			w.scrollDirection = "both"; // same for "both"
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (scrollDirection='both')");
			assert.isTrue(domClass.contains(w, "d-scrollable"), // class added by the mixin delite/Scrollable
				"Expecting d-scrollable CSS class! (scrollDirection='both')");

			w.scrollDirection = "none"; // and none again
			w.validateRendering();
			assert.isTrue(domClass.contains(w, shared.containerCSSClassName),
				"Expecting " + shared.containerCSSClassName + " CSS class! (scrollDirection='none')");
			// when scrollDirection is "none", this CSS class should NOT be present:
			assert.isFalse(domClass.contains(w, "d-scrollable"),
				"Not expecting d-scrollable CSS class! (scrollDirection='none')");
		},

		"scrollableNode" : function () {
			var w = document.getElementById("sc1");
			w.validateRendering();
			assert.isTrue(w.scrollableNode === w, "Wrong scrollableNode!");
		},

		"scrollTop/scrollLeft" : function () {
			var w = document.getElementById("sc1");
			w.scrollDirection = "both";
			w.validateRendering();
			assert.equal(w.scrollableNode.scrollTop, 0, "scrollTop");
			assert.equal(w.scrollableNode.scrollLeft, 0, "scrollLeft");
		},

		"scrollBy" : function () {
			var w = document.getElementById("sc1");
			var d = this.async(1000);
			w.scrollDirection = "both";
			w.validateRendering();
			w.scrollBy({x: 10});
			assert.equal(w.scrollableNode.scrollLeft, 10, "scrollLeft #1");
			assert.equal(w.scrollableNode.scrollTop, 0, "scrollTop #1");
			w.scrollBy({y: 10});
			assert.equal(w.scrollableNode.scrollLeft, 10, "scrollLeft #2");
			assert.equal(w.scrollableNode.scrollTop, 10, "scrollTop #2");
			w.scrollBy({x: 10, y: 10});
			assert.equal(w.scrollableNode.scrollLeft, 20, "scrollLeft #3");
			assert.equal(w.scrollableNode.scrollTop, 20, "scrollTop #3");
			
			// Now with animation:
			w.scrollBy({x: 10, y: 10}, 100/*duration*/);
			setTimeout(d.callback(function () {
				assert.equal(w.scrollableNode.scrollLeft, 30, "scrollLeft #4");
				assert.equal(w.scrollableNode.scrollTop, 30, "scrollTop #4");
				
				w.scrollBy({x: 10, y: 10}, 0/*duration*/);
				// when the duration is 0, no animation, thus no need to test asynchronously
				assert.equal(w.scrollableNode.scrollLeft, 40, "scrollLeft #5");
				assert.equal(w.scrollableNode.scrollTop, 40, "scrollTop #5");
			}), 1000);
			
			return d;
		},

		"scrollTo" : function () {
			var w = document.getElementById("sc1");
			var d = this.async(1000);
			w.scrollDirection = "both";
			w.validateRendering();
			w.scrollTo({x: 10});
			assert.equal(w.scrollableNode.scrollLeft, 10, "scrollLeft #1");
			w.scrollTo({y: 10});
			assert.equal(w.scrollableNode.scrollTop, 10, "scrollTop #1");
			w.scrollTo({x: 20, y: 20});
			assert.equal(w.scrollableNode.scrollLeft, 20, "scrollLeft #2");
			assert.equal(w.scrollableNode.scrollTop, 20, "scrollTop #2");
			
			// Now with animation:
			w.scrollTo({x: 30, y: 30}, 100/*duration*/);
			setTimeout(d.callback(function () {
				assert.equal(w.scrollableNode.scrollLeft, 30, "scrollLeft #3");
				assert.equal(w.scrollableNode.scrollTop, 30, "scrollTop #3");
				
				w.scrollTo({x: 40, y: 40}, 0/*duration*/);
				// when the duration is 0, no animation, thus no need to test asynchronously
				assert.equal(w.scrollableNode.scrollLeft, 40, "scrollLeft #4");
				assert.equal(w.scrollableNode.scrollTop, 40, "scrollTop #4");
			}), 1000);
			
			return d;
		},

		"getCurrentScroll" : function () {
			var w = document.getElementById("sc1");
			var pos = {x: 10, y: 10};
			w.scrollDirection = "both";
			w.validateRendering();
			w.scrollTo(pos);
			assert.deepEqual(w.getCurrentScroll(), pos, "Wrong getCurrentScroll!");
		},

		"isTop/Bottom/Left/RightScroll" : function () {
			var w = document.getElementById("sc1");
			var wContent = document.getElementById("sc1content");
			var pos = {x: 10, y: 10};
			var box = domGeom.getMarginBox(wContent);
			var width = box.w;
			var height = box.h;
			w.scrollDirection = "both";
			w.validateRendering();
			w.scrollTo(pos);
			assert.isFalse(w.isTopScroll(), "isTopScroll() #1");
			assert.isFalse(w.isBottomScroll(), "isBottomScroll() #1");
			assert.isFalse(w.isRightScroll(), "isRightScroll() #1");
			assert.isFalse(w.isLeftScroll(), "isLeftScroll() #1");

			pos = {x: 0, y: 10};
			w.scrollTo(pos);
			assert.isFalse(w.isTopScroll(), "isTopScroll() #2");
			assert.isFalse(w.isBottomScroll(), "isBottomScroll() #2");
			assert.isFalse(w.isRightScroll(), "isRightScroll() #2");
			assert.isTrue(w.isLeftScroll(), "isLeftScroll() #2");

			pos = {x: 10, y: 0};
			w.scrollTo(pos);
			assert.isTrue(w.isTopScroll(), "isTopScroll() #3");
			assert.isFalse(w.isBottomScroll(), "isBottomScroll() #3");
			assert.isFalse(w.isRightScroll(), "isRightScroll() #3");
			assert.isFalse(w.isLeftScroll(), "isLeftScroll() #3");

			pos = {x: width, y: 10};
			w.scrollTo(pos);
			assert.isFalse(w.isTopScroll(), "isTopScroll() #4");
			assert.isFalse(w.isBottomScroll(), "isBottomScroll() #4");
			assert.isTrue(w.isRightScroll(), "isRightScroll() #4");
			assert.isFalse(w.isLeftScroll(), "isLeftScroll() #4");

			pos = {x: 10, y: height};
			w.scrollTo(pos);
			assert.isFalse(w.isTopScroll(), "isTopScroll() #5");
			assert.isTrue(w.isBottomScroll(), "isBottomScroll() #5");
			assert.isFalse(w.isRightScroll(), "isRightScroll() #5");
			assert.isFalse(w.isLeftScroll(), "isLeftScroll() #5");

			pos = {x: 0, y: 0};
			w.scrollTo(pos);
			assert.isTrue(w.isTopScroll(), "isTopScroll() #6");
			assert.isFalse(w.isBottomScroll(), "isBottomScroll() #6");
			assert.isFalse(w.isRightScroll(), "isRightScroll() #6");
			assert.isTrue(w.isLeftScroll(), "isLeftScroll() #6");
		},

		"destroy during scroll animation" : function () {
			var d = this.async(1000);
			var errorCounter = 0;
			var errorMsg;
			window.onerror = function (msg, url, lineNumber) {
				errorCounter++;
				errorMsg = "After destroy: " + msg + "\nURL: " + url +
					"\nLine number: " + lineNumber;
				console.log(errorMsg);
			};
			var w = document.getElementById("sc1");
			w.scrollDirection = "both";
			w.validateRendering();

			// Scroll with animation
			w.scrollBy({x: 10, y: 10}, 300/*duration*/);

			// Destroy while an animation is ongoing
			try {
				// The variant with preserveDom at false is the most dangerous.
				w.destroy(false/*preserveDom*/);
			} catch (e) {
				assert.isTrue(false, "destroy(false) should not throw an error: " + e);
			}
			// Check that no error has been thrown asynchronously due to the animation
			setTimeout(d.callback(function () {
				assert.equal(errorCounter, 0, errorMsg);
			}), 500); // smaller than the total timeout of the test case
		}
	};
	
	return shared;
});
