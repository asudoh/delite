define([
	"dcl/dcl",
	"dojo/when",
	"./Invalidating"
], function (dcl, when, Invalidating) {
	var isStoreInvalidated = function (props) {
		return props.store || props.query;
	};

	var setStoreValidate = function (props) {
		props.store = props.query = false;
	};

	function getObservableArrayClz() {
		try {
			return require("liaison/ObservableArray");
		} catch (e) {}
	}

	/**
	 * Mixin for widgets for store management that creates widget render items from store items after
	 * querying the store. The receiving class must extend delite/Stateful and dojo/Evented or
	 * delite/Widget.
	 *
	 * Classes extending this mixin automatically create render items that are consumable by the widget
	 * from store items after querying the store. This happens each time the widget store, query or
	 * queryOptions properties are set. If that store is Observable it will be observed and render items
	 * will be automatically updated, added or deleted from the items property based on store notifications.
	 *
	 * @mixin module:delite/Store
	 * @augments module:delite/Invalidating
	 */
	return dcl(Invalidating, /** @lends module:delite/Store# */{
		/**
		 * The store that contains the items to display.
		 * @member {dstore/Store}
		 * @default null
		 */
		store: null,

		/**
		 * A query filter to apply to the store.
		 * @member {Object}
		 * @default {}
		 */
		query: {},

		/**
		 * A function that processes the collection returned by the store query and returns a new collection
		 * (to sort it, range it etc...). This processing is applied before potentially tracking the store
		 * for modifications (if Observable).
		 * Changing this function on the instance will not automatically refresh the class.
		 * @default identity function
		 */
		processQueryResult: function (store) { return store; },

		/**
		 * The render items corresponding to the store items for this widget. This is filled from the store and
		 * is not supposed to be modified directly. Initially null. 
		 * @member {Object[]}
		 * @default null
		 */
		renderItems: null,

		preCreate: function () {
			// we want to be able to wait for potentially several of those properties to be set before
			// actually firing the store request
			this.addInvalidatingProperties({
				"store": "invalidateProperty",
				"query": "invalidateProperty",
				"renderItems": "invalidateProperty"
			});
			this.renderItems = []; // Set empty initial value
		},

		/**
		 * Creates a store item based from the widget internal item.
		 * @param {Object} renderItem - The render item.
		 * @returns {Object}
		 */
		renderItemToItem: function (renderItem) {
			return renderItem;
		},

		/**
		 * Returns the widget internal item for a given store item. By default it returns the store
		 * item itself.
		 * @param {Object} item - The store item.
		 * @returns {Object}
		 * @protected
		 */
		itemToRenderItem: function (item) {
			return item;
		},

		/**
		 * This method is called once the query has been executed to initial the renderItems array
		 * with the list of initial render items.
		 *
		 * This method sets the renderItems property to the render items array passed as parameter. Once
		 * done, it fires a 'query-success' event.
		 * @param {Object[]} renderItems - The array of initial render items to be set in the renderItems property.
		 * @protected
		 */
		initItems: function (renderItems) {
			// Make sure using push() method of this.renderItems
			this.renderItems.push.apply(this.renderItems, renderItems);
			this.emit("query-success", { renderItems: this.renderItems, cancelable: false, bubbles: true });
		},

		/**
		 * If the store parameters are invalidated, queries the store, creates the render items and calls initItems() 
		 * when ready. If an error occurs a 'query-error' event will be fired.
		 * @param props
		 * @protected
		 */
		refreshProperties: function (props) {
			var storeInvalidated = isStoreInvalidated(props),
				renderItemsInvalidated = props.renderItems;
			if (renderItemsInvalidated) {
				var old = this._hRenderItems && this._hRenderItems.renderItems;
				this._unobserveRenderItems();
				this._itemsSpliced([{object: this.renderItems || [], index: 0, removed: old || [], addedCount: 0}]);
				var ObservableArray = getObservableArrayClz();
				// Using a plain object here, as well as the following this._hRenderItems.renderItems thing,
				// is a kludge to work around delite/Invalidating not sending out older value
				this._hRenderItems = !ObservableArray || !ObservableArray.canObserve(this.renderItems) ? {} :
					ObservableArray.observe(this.renderItems, this._itemsSpliced.bind(this));
				this._hRenderItems.renderItems = this.renderItems;
				this._itemsSpliced([
					{object: this.renderItems, index: 0, removed: [], addedCount: this.renderItems.length}
				]);
			}
			if (storeInvalidated) {
				setStoreValidate(props);
				this.queryStoreAndInitItems(this.processQueryResult);
			}
		},

		/**
		 * Queries the store, creates the render items and calls initItems() when ready. If an error occurs
		 * a 'query-error' event will be fired.
		 *
		 * This method is not supposed to be called by application developer.
		 * It will be called automatically when modifying the store related properties or by the subclass
		 * if needed.
		 * @param processQueryResult - A function that processes the collection returned by the store query
		 * and returns a new collection (to sort it, range it etc...)., applied before tracking.
		 * @returns {Promise} If store to be processed is not null a promise that will be resolved when the loading 
		 * process will be finished.
		 * @protected
		 */
		queryStoreAndInitItems: function (processQueryResult) {
			this._untrack();
			if (this.store != null) {
				var collection = processQueryResult.call(this, this.store.filter(this.query));
				if (collection.track) {
					// user asked us to observe the store
					collection = this._tracked = collection.track();
					collection.on("add", this._storeItemAdded.bind(this));
					collection.on("update", this._storeItemUpdated.bind(this));
					collection.on("remove", this._storeItemRemoved.bind(this));
				}
				return this.fetch(collection);
			}
		},

		/**
		 * Called to process the items returned after querying the store.
		 * @param {dstore/Collection} collection - Items to be displayed.
		 */
		fetch: function (collection) {
			return when(collection.map(function (item) {
				// if we have a mapping function between store item and some intermediary items use it
				return this.itemToRenderItem(item);
			}, this)).then(this.initItems.bind(this), this._queryError.bind(this));
		},

		_queryError: function (error) {
			console.log(error);
			this.emit("query-error", { error: error, cancelable: false, bubbles: true });
		},

		_unobserveRenderItems: function () {
			// There is a kludge that defines _hRenderItems as a plain object (instead of a handle)
			// to work around delite/Invalidating not sending out older value
			if (this._hRenderItems && typeof this._hRenderItems.remove === "function") {
				this._hRenderItems.remove();
				this._hRenderItems = null;
			}
		},

		_untrack: function () {
			if (this._tracked) {
				this._tracked.tracking.remove();
				this._tracked = null;
			}
		},

		destroy: function () {
			this._unobserveRenderItems();
			this._untrack();
		},

		_setRenderItemsAttr: function (renderItems) {
			// We no longer use store if renderItems is explicitly set
			this.store = null;
			// Ensure renderItems is an array
			this._set("renderItems", Array.isArray(renderItems) ? renderItems : []);
		},

		/**
		 * This method is called when there are changes in `.renderItems`.
		 * @param {module:liaison/Observable~ChangeRecord[]} splices
		 *     The change records of splice,
		 *     same format as {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ES7 Array.observe()}.
		 * @protected
		 */
		_itemsSpliced: function (splices) {
			this.itemsSpliced(splices.map(function (splice) {
				return {
					object: splice.object,
					index: splice.index,
					removedCount: splice.removed.length,
					added: splice.object.slice(splice.index, splice.index + splice.addedCount)
				};
			}));
		},

		/**
		 * This method is called when there are changes in `.renderItems`.
		 * @param {Object[]} splices
		 *     The change records of splice, slightly modified format of
		 *     {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ES7 Array.observe()}.
		 * @protected
		 */
		itemsSpliced: function () {},

		/**
		 * This method is called when there are collection mutations in store.
		 * @param {Object[]} splices
		 *     The change records of splice, slightly modified format of
		 *     {@link http://wiki.ecmascript.org/doku.php?id=harmony:observe ES7 Array.observe()}.
		 * @protected
		 */
		storeItemsSpliced: function (splices) {
			var ObservableArray = getObservableArrayClz(),
				renderItemsObservable = ObservableArray && ObservableArray.canObserve(this.renderItems);
			splices.forEach(function (splice) {
				this.renderItems.splice.apply(this.renderItems,
					[splice.index, splice.removedCount].concat(splice.added));
			}, this);
			if (!renderItemsObservable) {
				this.itemsSpliced(splices);
			}
		},

		/**
		 * When the store is observed and an item is removed in the store this method is called to remove the
		 * corresponding render item. This can be redefined but must not be called directly.
		 * @param {Event} event - The "remove" `dstore/Observable` event.
		 * @protected
		 */
		_storeItemRemoved: function (event) {
			if (event.previousIndex !== undefined) {
				this.storeItemsSpliced([
					{
						index: event.previousIndex,
						removedCount: 1,
						added: []
					}
				]);
			}
			// if no previousIndex the items is removed outside of the range we monitor so we don't care
		},

		/**
		 * When the store is observed and an item is updated in the store this method is called to update the
		 * corresponding render item.  This can be redefined but must not be called directly.
		 * @param {Event} event - The "update" `dstore/Observable` event.
		 * @private
		 */
		_storeItemUpdated: function (event) {
			if (event.index === undefined) {
				// this is actually a remove
				this.storeItemsSpliced([
					{
						index: event.previousIndex,
						removedCount: 1,
						added: []
					}
				]);
			} else if (event.previousIndex === undefined) {
				// this is actually a add
				this.storeItemsSpliced([
					{
						index: event.index,
						removedCount: 1,
						added: [this.itemToRenderItem(event.target)]
					}
				]);
			} else if (event.index !== event.previousIndex) {
				// this is a move
				this.storeItemsSpliced([
					{
						index: event.previousIndex,
						removedCount: 1,
						added: [],
						// TODO: removedItemsWillBeBack is a kludgy way to tell
						// that the removed items will be back to the collection,
						// so that list-type widget can preserve selection in the condition, etc.
						// In future, we may leverage the notion synthetic change record for "move" scenario.
						removedItemsWillBeBack: true
					},
					{
						index: event.index - (event.previousIndex < event.index ? 1 : 0),
						removedCount: 0,
						added: [this.itemToRenderItem(event.target)]
					}
				]);
			} else {
				this.storeItemsSpliced([
					{
						index: event.index,
						removedCount: 1,
						added: [this.itemToRenderItem(event.target)]
					}
				]);
			}
		},

		/**
		 * When the store is observed and an item is added in the store this method is called to add the
		 * corresponding render item. This can be redefined but must not be called directly.
		 * @param {Event} event - The "add" `dstore/Observable` event.
		 * @private
		 */
		_storeItemAdded: function (event) {
			if (event.index !== undefined) {
				this.storeItemsSpliced([
					{
						index: event.index,
						removedCount: 0,
						added: [this.itemToRenderItem(event.target)]
					}
				]);
			}
			// if no index the item is added outside of the range we monitor so we don't care
		}
	});
});
