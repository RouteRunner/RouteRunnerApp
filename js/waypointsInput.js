// create global map object
var map;

//variables to capture waypoints and origin input
var originForExport = "";
var waypointsArray = [];


/********************************************* ORIGIN ******************************************************/

//create backbone model to store origin location
var OriginPoint = Backbone.Model.extend({
	urlRoot : "/origin",
	defaults : {
		originName : "Origin not set"
	},
	initialize : function () {
		this.fetch({success: function (collection, response) {
				originForExport = response.originName;
			}
		});
	},
});

//create backbone View for Origin model
var OriginPointView = Backbone.View.extend({
	render : function () {
	$("#inputOrigin").html(this.model.get("originName"));
	},
	initialize : function() {
		this.model.on("change", this.render, this);
		var originName = '<p class="top-buffer well well-sm" id="inputOrigin"></p>';
		var originNameInput = '<input class="form-control" id=originNameInput type="search" placeholder="Enter Origin Here..." />';
		var submitBtn = '<div class="modal-footer"><button class="btn btn-default" data-dismiss="modal" id="originSubmit">Submit</button></div>';
		$("#originRow").append(originName);
		this.$el.html(originNameInput + submitBtn);
		this.render();
	},
	events : {
		"click #originSubmit"  : "setName"
	},
	setName : function () {
		//get inputted string from user
		var str = this.$el.find("#originNameInput").val();

		//update and save model, and update originForExport var
		this.model.set("originName", str);
		this.model.save();
		originForExport = str;

		//replace old input with blank string to clear field
		$("#originNameInput").val("");
		this.render();
	},
});

/********************************************* NOTES ******************************************************/

//create Backbone model to store notes
var NotesItem = Backbone.Model.extend({
	defaults : {
		id       : null,
		listitem : "",
		status   : "notDone",
		waypoint : ""
	},
});

var NotesView = Backbone.View.extend({
	template: _.template('<label class="center-block" id="checkOff">' + '<% if(status === "superDone") print("√  ")%>' + '<h4 class="<%= status %> notesbox"><%= listitem %></h4></label>'),
	initialize : function() {
		this.model.on('change', this.render, this);
		this.model.on('destroy', this.remove, this);
	},
	events : {
		"click #checkOff" : "toggleNote",
	},
	toggleNote : function(){
		if(this.model.get('status') === 'notDone'){
			this.model.set({'status' : 'superDone'});
		}else{
			this.model.set({'status' : 'notDone'});
		}
		this.model.save();
	},
	render : function() {
		var attributes = this.model.toJSON();
		this.$el.html(this.template(attributes));
	},

});

var NotesCollection = Backbone.Collection.extend({
	model      : NotesItem,
	url        : "/notesCollection",
	initialize : function (options) {

		//enable uniqueName to be passed in from constructor and stored
		_.extend(this, _.pick(options, "uniqueName"));

		//build collection on load, fetch data from database based on uniqueName for waypoint
		this.fetch({data : {waypoint : this.uniqueName}});
	}
});

var NotesCollectionView = Backbone.View.extend({
	render : function() {
		var modalContainer = '<div class="modal fade" id="' + this.uniqueName + '" role="dialog"><div class="modal-dialog"><div class="modal-content" id="notesLightbox">';
		var body = '<div class="modal-body">';
		var label = '<label><h4>Notes:</h4></label>';
		var notesDiv = '<div class="input-group">';
		var tskBtn = '<span class="input-group-btn"><button type="button" class="btn btn-primary" id="tskBtn"> Add</button></span>';
		var notesInput = '<input class="form-control" id=notesInput type="search" placeholder="Type Here..." /></div>';
		var notesList = '<ol id="notes-list' + this.uniqueName + '" class="top-buffer"></ol></div>';
		var clrBtn = '<div class="modal-footer" id="notesFooter"><button class=" btn btn-default btn-sm pull-left" data-dismiss="modal">X</button><button class="btn btn-default" id="clrBtn" type= "submit">Clear √</button></div>';
		var closingStuff = '</div></div></div>'
		this.$el.html(modalContainer + body + label + notesDiv + tskBtn + notesInput  + notesList + clrBtn + closingStuff);
	},
	initialize : function(options) {

		//enable uniqueName to be passed in from constructor and stored in view
		_.extend(this, _.pick(options, "uniqueName"));

		//tie 'add' event to trigger addOne, triggered when adding models as collection is fetched or when user adds note
		this.listenTo(this.collection, 'add', this.addOne);
	},
	events : {
		"click #tskBtn" : "updateOnClick",
		"click #clrBtn" : "delete",
		"keypress #notesInput": "enterKey"
	},
	updateOnClick : function (e) {

		//get string from input field
		var str = this.$el.find("#notesInput").val();

		//get unique name from notesCollectionView instance (passed into constructor when instance was created)
		var uniqueName = this.uniqueName;

		//add a new note model to collection, set inputted string and unique name, triggers 'add' event in collection
		if (str !== ''){
			this.collection.create({
				listitem : str,
				waypoint : uniqueName,
			});	
		}
	},
	addOne : function(model) {
		//create new view, render and append for a newly added note, either by fetching collection or user input
		var noteView = new NotesView({model : model, tagName : "li"});

		noteView.render();

		$('#notes-list' + this.uniqueName).append(noteView.$el);
	},
	delete : function () {
		var notesToDestroy = [];
		this.collection.each(function(note){
			if(note.get('status') === 'superDone'){
				notesToDestroy.push(note);
			}
		})
		if(notesToDestroy.length === 0){
      		alert('Please select one or more "notes" to Clear');
		}
		notesToDestroy.forEach(function(note){
			note.destroy();
		})
    },
    enterKey: function (e){
        if(e.keyCode == 13) {
            this.updateOnClick();
        }
    },

});


/********************************************* WAYPOINT ******************************************************/

//create backbone model to store data about each waypoint/stop in route
var Waypoint = Backbone.Model.extend({
	defaults : {
		id       : null,
		location :  "",
		place    : {},
	},
});

//create backbone View for Waypoint model
var WaypointView = Backbone.View.extend({
	render : function () {
		//get unique name for noteBtn id, then remove spaces and commas
		var uniqueName = this.model.get("location");
		uniqueName = uniqueName.replace(/[,\s]+/g, '');

		var noteBtn = '<div class="pull-left"><a href="#' + uniqueName + '" data-toggle="modal"><button type="button" id="openNotes" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></button></a></div>';
		var locationName = '<h4 class="waypointName">' + this.model.get("location") + '</h4>';
		var delBtn = '<div class="pull-right"><button type="button" class="btn btn-default btn-sm" id="delBtn"><span class="glyphicon glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>';
		this.$el.html(noteBtn + delBtn + locationName);

	},
	initialize : function () {
		//event listener to render waypoint view on changes to model
		this.model.on("change", this.render, this);
		this.model.on("destroy", this.remove, this);

		//get unique name for noteBtn id, then remove spaces and commas
		var uniqueName = this.model.get("location");
		uniqueName = uniqueName.replace(/[,\s]+/g, '');

		//pass uniqueName to NotesCollectionView constructor so that it can build new modal with matching id
		var notesCollection = new NotesCollection({uniqueName : uniqueName});
		var notesCollectionView = new NotesCollectionView({collection : notesCollection, uniqueName : uniqueName});
		notesCollectionView.render();

		$(notesCollectionView.$el).appendTo(document.body);

	},
	events : {
		"click #delBtn" : "delete"
	},
	delete : function () {
		//remove waypoint from waypointsArray
		var locationNameToRemove = this.model.get("location");

		//iterate over array and find index of matching location
		for(var i = 0; i < waypointsArray.length; i++) {
			if(waypointsArray[i].location === locationNameToRemove){
				indexOfObjectToRemove = i;
			}
		}

		//remove 1 item from array at index found for location
		waypointsArray.splice(indexOfObjectToRemove, 1);

		// //removing flags
		markerArray[indexOfObjectToRemove].setMap(null);
		markerArray.splice(indexOfObjectToRemove,1);
		centerArray.splice(indexOfObjectToRemove,1);

		//delete model and remove view
    	this.model.destroy();
    	this.remove();
    },
});

//create backbone collection for Waypoints
var WaypointCollection = Backbone.Collection.extend({
	model      : Waypoint,
	url        : "/waypointCollection",
	initialize : function () {
		this.fetch({success: function (collection, response) {
			console.log('response:');
			console.log(response);

			//process response from server
			for (i = 0; i < response.length; i++) {
				//strip id's from response objects and save as waypointsArray for use in calcRoute
				waypointsArray.push({location : response[i].location});
					
				//rebuild marker for each waypoint returned
				buildMarker(response[i].place);
			}
			}
		});
	}
});

//create backbone view to display collection of waypoints/stops
var WaypointCollectionView = Backbone.View.extend({
	render : function () {
		var addBtn = '<div class="input-group" id="inputdiv"><span class="input-group-btn"><button type="button" class="btn btn-primary btn-round btn-outline" id="addBtn"><i class="glyphicon glyphicon-plus"></i></button></span>';
		var locationNameInput = '<input class="form-control" id=locationNameInput type="search" placeholder="Enter New Destination..." /></div>';
		var wayList = '<ol id="waypoint-list"></ol>';
		var clrRoutes = '<button type="button" id="clrRoutes" class="btn btn-default btn-sm pull-right">Clear Routes</button>';
    	this.$el.html(addBtn + locationNameInput + wayList + clrRoutes);
	},
	initialize : function () {
		this.listenTo(this.collection, 'add', this.addOne)
	},
	events : {
		"click #addBtn"  : "updateOnClick",
		"click #clrRoutes" : "clearRoutes"
	},
	clearRoutes : function() {
		var modelsToDestroy = [];
		this.collection.each(function(model){
			modelsToDestroy.push(model);
		});
		for(var i = 0; i < markerArray.length; i++) {
			markerArray[i].setMap(null);
		};
		modelsToDestroy.forEach(function(model){
			model.destroy();
			for(var i = 0; i < centerArray.length; i++){
				if(!centerArray[i].label){
					centerArray.splice(i,1);
				}
			};
		});
		waypointsArray = [];
		markerArray = [];
	},
	updateOnClick : function (e) {
		var str = this.$el.find("#locationNameInput").val();

		if(str === ''){
			//show alert modal if no string is inputted to add
	    	$('#waypointsAlert').modal('show');
		}else{
			//create new model, save to server and add to colleciton, triggers 'add' event in collection
			//view created/appended in 'addOne' method, called in 'add' event listener
			this.collection.create({
				location : str,
				//place    : place,
				place   : placeLatLng,
			});

			//push location onto waypoints array for exporting
			var waypointObject = {location : str};
			waypointsArray.push(waypointObject);
			
			//reset input value to blank string to clear old entry
			$("#locationNameInput").val("");
		}
	},
	addOne : function (model) {
		// create view for new model
        var view = new WaypointView({model : model, tagName : "li", className : "waypointStyle"});
        //render new view
        view.render();

        //append new view to list of waypoints (collection view's div)
        $("#waypoint-list").append(view.$el);
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
	waypointCollectionView = new WaypointCollectionView({collection : waypointCollection, el : "#destinations"});
	waypointCollectionView.render();

	//assign origin point and origin point view to new backbone objects
	originPointModel = new OriginPoint();
	var originPointView = new OriginPointView({model : originPointModel});
	originPointView.render();

	//append origin point view and collection view to appropriate divs in index.html
	$("#origindiv").append(originPointView.$el);
	$("#destinations").append(waypointCollectionView.$el);

});
