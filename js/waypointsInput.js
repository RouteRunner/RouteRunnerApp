console.log("in waypointsInput.js");

var originForExport = "";
var waypointsArray = [];

//create backbone model to store origin location
var OriginPoint = Backbone.Model.extend({
	defaults : {
		originName : ""
	},
	setName : function (str) {
		console.log("in setName, input str is:");
		console.log(str);
		this.set("originName", str); 
		originForExport = str;
		console.log('setting originForExport to:');
		console.log(originForExport);
	},
});

//create backbone View for Origin model
var OriginPointView = Backbone.View.extend({
	render : function () {
		console.log("in render of originPointView");
		var originName = this.model.get("originName");
		var originNameInput = '<input id=originNameInput type="text" value="Enter Origin Here..." />';
		this.$el.html("<div>" + originNameInput + "</div>");
	},
	events : {
		"keypress #originNameInput"  : "updateOnEnter",
		// add other events for view
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

    //add other methods
});

//create backbone model to store data about each waypoint/stop in route
var Waypoint = Backbone.Model.extend({
	defaults : {
		locationName :  "",
		latLon       :  "", //use google.maps.LatLng to generate LatLng object??
		
		//add other defualt data members
	},
	initialize : function () {
		// is this possible? --> latLon = new google.maps.LatLng(locationName);
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
	//add other methods
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
		// add other events for view
	},
	delete : function () {
    	this.model.del();
    	this.remove();
    },
    updateOnEnter : function (e) {
		if(e.keyCode == 13) {
			this.replaceName();
		}
	},
	replaceName : function () {
		var str = this.$el.find("#nameInput").val();
		this.model.replaceName(str);
	},

    //add other methods
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
		var addBtn = "<button id='addBtn'>Add Waypoint</button>"; 
		var div = '<div id="waypoint-list"></div>';
        this.$el.html(div + locationNameInput);
	},
	initialize : function () {
		this.listenTo(this.collection, 'add', this.addOne)
	},
	events : {
		"click #addBtn"                : "addToCollection",
		"keypress #locationNameInput"  : "updateOnEnter",
	},
	updateOnEnter : function (e) {
		if(e.keyCode == 13) {
			var str = this.$el.find("#locationNameInput").val();
			this.addToCollection(str);
			//this.replacePlaceholderText();
		}
	},
	replacePlaceholderText : function () {
	//FUNCTION NOT WORKING AS DESIRED YET
	// 	console.log("in replacePlaceholderText")
	// 	var str = "Enter New Waypoint Here...";
	// 	this.$el.value = str;
	// 	console.log("this.$el :");
	// 	console.log(this.$el);
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
		console.log(waypointsArray);
	},
	addOne : function (model) {
		// create view for new model
        var view = new WaypointView({model : model});
        
        //render new view
        view.render();

        //append new view to list of waypoints (colleciton view's div)
        this.$("#waypoint-list").append(view.$el);
	},

	//add other methods
});



var waypointCollection, 
	waypointCollectionView, 
	originPointModel, 
	originPointView;

$(document).ready( function () {

	var waypointCollection = new WaypointCollection();
	var waypointCollectionView = new WaypointCollectionView({collection : waypointCollection});
	waypointCollectionView.render();

/*!!!!!!!!!!!!!!!!!!!! MAKE SURE #listdiv MATCHES IN HTML !!!!!!!!!!!!!!!!*/
	originPointModel = new OriginPoint();
	var originPointView = new OriginPointView({model : originPointModel});
	originPointView.render();
	$("#origindiv").append(originPointView.$el);
	$("#listdiv").append(waypointCollectionView.$el);

});


//export origin location and array of waypoints for use in app.js
module.exports = {
	originLocation      : originForExport,
	waypointsArray      : waypointsArray
};