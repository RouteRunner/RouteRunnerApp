// create global map object
var map;

//variables to capture waypoints and origin input
var originForExport = "";
var waypointsArray = [];

//create Backbone model to store notes
var NotesItem = Backbone.Model.extend({
	defaults : {
		id       : null,
		listitem : "",
		status   : "notDone",
		waypoint : ""
	},
	initialize : function () {
		//this.fetch();
	},
	toggleNote : function(){
		if(this.get('status') === 'notDone'){
			this.set({'status' : 'superDone'});
		}else{
			this.set({'status' : 'notDone'});
		}
		this.save();
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
		this.model.toggleNote();
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

		console.log("initializing notesCollection, fecthing");
		this.fetch({data : {waypoint : this.uniqueName}});
	}
});

var NotesCollectionView = Backbone.View.extend({
	render : function() {
		var modalContainer = '<div class="modal fade" id="' + this.uniqueName + '" role="dialog"><div class="modal-dialog"><div class="modal-content" id="notesLightbox">';
		var body = '<div class="modal-body">';
		var label = '<label><h4>Notes' + this.uniqueName + '</h4></label>';
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

		//tie 'add' event to trigger addOne
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

		//add a new item to collection, pass in inputted string
		if (str !== ''){
			this.addToCollection(str);
			this.$("#notesInput").val("");
		}
	},
	addToCollection : function(str) {
		this.collection.create({
			listitem : str,
			waypoint : this.uniqueName,
		});
	},
	addOne : function(model) {
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

//create backbone model to store origin location
var OriginPoint = Backbone.Model.extend({
	urlRoot : "/origin",
	defaults : {
		originName : "Finding Current GPS location..."
	},
	initialize : function () {
		console.log("initializing Origin Point, fetching...")
		//this.fetch();
		this.fetch({success: function (collection, response) {
				originForExport = response.originName;
			}
		});
	},
	setName : function (str) {
		this.set("originName", str);
		this.save();
		originForExport = str;
	},
});

//create backbone View for Origin model
var OriginPointView = Backbone.View.extend({
	render : function () {
	$("#inputOrigin").html(this.model.get("originName"));
	},
	initialize : function() {
		this.model.on("change", this.render, this);
		var originName = '<div class="col-md-4 pull-right">' + '<h4>Origin: </h4><span id="inputOrigin"></span>' + '</div>';
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
		var str = this.$el.find("#originNameInput").val();
		this.model.setName(str);
		$("#originNameInput").val("");
		this.render();
	},
});

//create backbone model to store data about each waypoint/stop in route
var Waypoint = Backbone.Model.extend({
	defaults : {
		id       : null,
		location :  "",
	},
	initialize : function () {
		//this.fetch();
	},
	del : function () {this.destroy({
			success: function() {
				console.log("model destroyed");
			},
			wait: true
		});
	},
	replaceName : function (str) {
		this.set("location" , str);
		this.save();
	},
});

//create backbone View for Waypoint model
var WaypointView = Backbone.View.extend({
	render : function () {
		//get unique name for noteBtn id
		var uniqueName = this.model.get("location");

		//remove spaces and commas
		uniqueName = uniqueName.replace(/[,\s]+/g, '');

		var noteBtn = '<span class="input-group-btn"><a href="#' + uniqueName + '" data-toggle="modal"><button type="button" id="openNotes" class="btn btn-default"><span class="glyphicon glyphicon-list-alt" aria-hidden="true"></span></button></a></span>';
		var locationName = '<div class="center-block text-center">' + this.model.get("location") + '</div>';
		var delBtn = '<span class="input-group-btn"><button type="button" class="btn btn-default" id="delBtn"> <span class="glyphicon glyphicon glyphicon-remove" aria-hidden="true"></span></button></span>';
		this.$el.html(noteBtn + locationName + delBtn);

	},
	initialize : function () {
		this.model.on("change", this.render, this);

		//get unique name for noteBtn id
		var uniqueName = this.model.get("location");

		//remove spaces and commas
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
		// markerArray[indexOfObjectToRemove].setMap(null);
		// markerArray.splice(indexOfObjectToRemove,1);

		//delete model and remove view
    	this.model.del();
    	this.remove();
    },
});

//create backbone collection for Waypoints
var WaypointCollection = Backbone.Collection.extend({
	model      : Waypoint,
	url        : "/waypointCollection",
	initialize : function () {
		this.fetch({success: function (collection, response) {
				waypointsArray = response;
			}
		});
	}
});

//create backbone view to display collection of waypoints/stops
var WaypointCollectionView = Backbone.View.extend({
	render : function () {
		var locationNameInput = '<input class="form-control" id=locationNameInput type="search" placeholder="Enter New Waypoint Here..." />';
		var addBtn = '<span class="input-group-btn"><button type="button" class="btn btn-warning" id="addBtn"> Add</button></span>';
    	this.$el.html(addBtn + locationNameInput);
	},
	initialize : function () {
		this.listenTo(this.collection, 'add', this.addOne)
	},
	events : {
		"click #addBtn"  : "updateOnClick",
	},
	updateOnClick : function (e) {

		var str = this.$el.find("#locationNameInput").val();
		marker.setVisible(true);
		//add a new item to collection, pass in inputted string
		if (str !== ''){
			this.addToCollection(str);
			$("#locationNameInput").val("");
		}
	},
	addToCollection : function (str) {
		// create new model, save to server and add to colleciton, triggers 'add' event in collection
		this.collection.create({
			location : str
			//view created/appended in 'addOne' method, called in 'add' event listener
		});

		//push location onto waypoints array for exporting
		var waypointObject = {location : str};
		waypointsArray.push(waypointObject);
	},
	addOne : function (model) {
		// create view for new model
        var view = new WaypointView({model : model, tagName : "li", className : "input-group"});

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
	waypointCollectionView = new WaypointCollectionView({collection : waypointCollection, el : "#inputdiv"});
	waypointCollectionView.render();

	//assign origin point and origin point view to new backbone objects
	originPointModel = new OriginPoint();
	var originPointView = new OriginPointView({model : originPointModel});
	originPointView.render();

	//append origin point view and collection view to appropriate divs in index.html
	$("#origindiv").append(originPointView.$el);
	$("#inputdiv").append(waypointCollectionView.$el);

});
