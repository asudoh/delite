define([
	"dojo/_base/kernel",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/window",
	"dojo/dom-construct",
	"dui/registry",
	"./Heading",
	"./ListItem",
	"./ProgressIndicator",
	"./RoundRectList",
	"./ScrollableView",
	"./viewRegistry",
	"dojo/has",
	"dojo/has!dojo-bidi?dui/mobile/bidi/TreeView"
], function(kernel, declare, lang, win, domConstruct, registry, Heading, ListItem, ProgressIndicator, RoundRectList, ScrollableView, viewRegistry, has, BidiTreeView){

	// module:
	//		dui/mobile/TreeView

	kernel.experimental("dui.mobile.TreeView");

	var TreeView = declare(has("dojo-bidi") ? "dui.mobile.NonBidiTreeView" : "dui.mobile.TreeView", ScrollableView, {
		// summary:
		//		A scrollable view with tree-style navigation.
		// description:
		//		This widget can be connected to a dojox/data/FileStore as a
		//		quick directory browser. You may use it when implementing the
		//		Master-Detail pattern.

		postCreate: function(){
			this._load();
			this.inherited(arguments);
		},
		
		_customizeListItem: function(listItemArgs){
		},

		_load: function(){
			this.model.getRoot(
				lang.hitch(this, function(item){
					var scope = this;
					var list = new RoundRectList();
					var listItemArgs = {
						label: scope.model.rootLabel,
						moveTo: '#',
						onClick: function(){ scope.handleClick(this); },
						item: item
					};
					this._customizeListItem(listItemArgs);
					var listitem = new ListItem(listItemArgs);
					list.addChild(listitem);
					this.addChild(list);
				})
			)
		},

		handleClick: function(li){
			// summary:
			//		Called when the user clicks a tree item.
			// li: dui/mobile/ListItem
			//		The item that the user clicked.
			var newViewId = "view_";
			if(li.item[this.model.newItemIdAttr]){
				newViewId += li.item[this.model.newItemIdAttr];
			}else{
				newViewId += "rootView";
			}
			newViewId = newViewId.replace('/', '_');
			if(registry.byId(newViewId)){  // view already exists, just transition to it
				registry.byNode(li.domNode).transitionTo(newViewId);
				return;
			}

			var prog = ProgressIndicator.getInstance();
			win.body().appendChild(prog.domNode);
			prog.start();

			this.model.getChildren(li.item,
				lang.hitch(this, function(items){
					var scope = this;
					var list = new RoundRectList();
					items.forEach(function(item){
						var listItemArgs = {
							item: item,
							label: item[scope.model.store.label],
							transition: "slide"
						};
						scope._customizeListItem(listItemArgs);
						if(scope.model.mayHaveChildren(item)){
							listItemArgs.moveTo = '#';
							listItemArgs.onClick = function(){ scope.handleClick(this); };
						}
						var listitem = new ListItem(listItemArgs);
						list.addChild(listitem);
					});

					var heading = new Heading({
						label: "Dynamic View",
						back: "Back",
						moveTo: viewRegistry.getEnclosingView(li.domNode).id
					});

					var newView = ScrollableView({
						id: newViewId
					}, domConstruct.create("div", null, win.body()));
					newView.addChild(heading);
					newView.addChild(list);
					newView.startup();
					prog.stop();
					registry.byNode(li.domNode).transitionTo(newView.id);
				})
			);
		}
	});
	
	return has("dojo-bidi") ? declare("dui.mobile.TreeView", [TreeView, BidiTreeView]) : TreeView;		
});
