
//variables to capture waypoints and origin input
var originForExport = "";
var waypointsArray = [];

//create backbone model to store origin location
var OriginPoint = Backbone.Model.extend({
	defaults : {
		originName : ""
	},
	setName : function (str) {
		this.set("originName", str); 
		originForExport = str;
	},
});

//create backbone View for Origin model
var OriginPointView = Backbone.View.extend({
	render : function () {
		var originName = this.model.get("originName");
		var originNameInput = '<input id=originNameInput type="text" value="Enter Origin Here..." />';
		this.$el.html("<div>" + originNameInput + "</div>");
	},
	events : {
		"keypress #originNameInput"  : "updateOnEnter",
	},
    updateOnEnter : function (e) {
		if(e.keyCode == 13) {
			this.setName();
		}
	},
	setName : function () {
		var str = this.$el.find("#originNameInput").val();
		this.model.setName(str);
	},
});

//create backbone model to store data about each waypoint/stop in route
var Waypoint = Backbone.Model.extend({
	defaults : {
		locationName :  "",
	},
	initialize : function () {
		this.fetch();
	},
	del : function () {
		this.destroy({success: function() {
			console.log("model destroyed");
		}});
	},
	replaceName : function (str) {
		this.set("locationName" , str);
		this.save();
	},
});

//create backbone View for Waypoint model
var WaypointView = Backbone.View.extend({
	render : function () {
		var locationName = this.model.get("locationName");
		var delBtn = "<button id=delBtn>Delete</button>";
		this.$el.html("<div>" + locationName + delBtn + "</div>");
	},
	initialize : function () {
		this.model.on("change", this.render, this);
	},
	events : {
		"click #delBtn"        : "delete" 
	},
	delete : function () {
		//remove waypoint from waypointsArray
		var locationNameToRemove = this.model.get("locationName");

		//iterate over array and find index of matching location
		for(var i = 0; i < waypointsArray.length; i++) {
			if(waypointsArray[i].location === locationNameToRemove){
				indexOfObjectToRemove = i;
				console.log("indexOfObjectToRemove");
				console.log(indexOfObjectToRemove);
			}
		}

		//remove 1 item from array at index found for location
		waypointsArray.splice(indexOfObjectToRemove, 1);

		//delete model and remove view
    	this.model.del();
    	this.remove();
    },
});

//create backbone collection for Waypoints 
var WaypointCollection = Backbone.Collection.extend({
	model      : Waypoint,
	url        : "/", // <------------------------------------------------CHECK
	initialize : function () {
		this.fetch();
	}
});

//create backbone view to display collection of waypoints/stops
var WaypointCollectionView = Backbone.View.extend({
	render : function () {
		var locationNameInput = '<input id=locationNameInput type="text" value="Enter New Waypoint Here..." />';
		var div = '<div id="waypoint-list"></div>';
        this.$el.html(div + locationNameInput);
	},
	initialize : function () {
		this.listenTo(this.collection, 'add', this.addOne)
	},
	events : {
		"keypress #locationNameInput"  : "updateOnEnter",
	},
	updateOnEnter : function (e) {
		if(e.keyCode == 13) {
			//get string from input field
			var str = this.$el.find("#locationNameInput").val();

			//add a new item to collection, pass in inputted string
			this.addToCollection(str);
		}
	},
	addToCollection : function (str) {
		// create new model, save to server and add to colleciton, triggers 'add' event in collection 
		this.collection.create({
			locationName : str
			//view created/appended in 'addOne' method, called in 'add' event listener
		});

		//push location onto waypoints array for exporting
		var waypointObject = {location : str};
		waypointsArray.push(waypointObject);
	},
	addOne : function (model) {
		// create view for new model
        var view = new WaypointView({model : model});
        
        //render new view
        view.render();

        //append new view to list of waypoints (colleciton view's div)
        this.$el.append(view.$el);
	},
});


//create variables for collection, collection view, origin point and origin point view
var waypointCollection, 
	waypointCollectionView, 
	originPointModel, 
	originPointView;

$(document).ready( function () {
	//assign collection and collection view to new backbone objects
	waypointCollection = new WaypointCollection();
	waypointCollectionView = new WaypointCollectionView({collection : waypointCollection});
	waypointCollectionView.render();

	//assign origin point and origin point view to new backbone objects 
	originPointModel = new OriginPoint();
	var originPointView = new OriginPointView({model : originPointModel});
	originPointView.render();

	//append origin point view and collection view to appropriate divs in index.html
	$("#origindiv").append(originPointView.$el);
	$("#listdiv").append(waypointCollectionView.$el);

});


