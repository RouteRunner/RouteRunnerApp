var map,
  marker,
  markerArray = [],
  centerArray = [],
  locationID,
  origin,
  input,
  searchbox,
  autocomplete,
  tempAuto,
  browserSupportFlag =  new Boolean(),
  place,
  routeIt,
  placeLatLng;
  

var rendererOptions = {
  draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();

//function used to initialize new map object
function initialize() {
  var mapOptions = {
    center: {lat: 45.5200, lng: -122.6819},
    zoom: 12,
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  originBtn = (document.getElementById('originSubmit'));
  gpsBtn = (document.getElementById('gpsBtn'));
  routeIt = (document.getElementById('routeIt'));
  origin = (document.getElementById('originNameInput'));
  input = (document.getElementById('locationNameInput'));
  
  searchBox = new google.maps.places.SearchBox(input);

  autoOrigin = new google.maps.places.Autocomplete(origin);
  autoOrigin.bindTo('bounds', map);

  autoInput = new google.maps.places.Autocomplete(input);
  autoInput.bindTo('bounds', map);

  //build marker and add waypoint when user selects item from autocomplete drop down
  google.maps.event.addListener(autoInput, 'place_changed', function () {
    buildMarker();
    waypointCollectionView.updateOnClick();
  })

  google.maps.event.addDomListener(routeIt, 'click', function(){
    directionsDisplay.setMap(map);
    calcRoute();
  });

  google.maps.event.addDomListener(clrRoutes, 'click', function(){
      directionsDisplay.setMap(null);
      centerArray[0].setVisible(true);

      var bounds = new google.maps.LatLngBounds();
      bounds.extend(centerArray[0].getPosition());
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }
      map.fitBounds(bounds);

  });

  google.maps.event.addDomListener(gpsBtn, 'click', geoLocate);

  google.maps.event.addDomListener(originBtn, 'click', function(){
    var originPlace = autoOrigin.getPlace();

    marker = new google.maps.Marker({
      animation : google.maps.Animation.DROP,
      map       : map,
      position  : {lat : originPlace.geometry.location.lat(), lng : originPlace.geometry.location.lng()},
      label: 'origin'
    });

    for(i = 0; i < centerArray.length; i++) {
      if(centerArray[i].label === 'origin'){
        centerArray[i].setMap(null);
        centerArray.splice(i, 1);
      }
    }
    centerArray.push(marker);

    var bounds = new google.maps.LatLngBounds();
    for(i = 0; i < centerArray.length; i++) {
      bounds.extend(centerArray[i].getPosition());
    }
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }
    map.fitBounds(bounds);

  });

}

/*helper funciton to build new marker, if no place is passed in, marker is created
  by grabbing entry from autocomplete bar, if placeInput is passed in marker is created using
  lat,lng from that place object (JSON string)*/
function buildMarker(placeInput){

  //check to see if placeInput has been provided
  if(!placeInput){
    //no input, get place info from autocomplete.getPlace() and assign to global place var
    place = autoInput.getPlace();

    //extract latLng object info from place object
    placeLatLng = {lat : place.geometry.location.lat(), lng : place.geometry.location.lng()}

  }else{
    //input provided, assign passed in place object to global placeLatLng var
    placeLatLng = JSON.parse(placeInput);

  }

  //create new marker, using location info from global place object
  marker = new google.maps.Marker({
    animation : google.maps.Animation.DROP,
    map       : map,
    position  : placeLatLng,
  });

  //push new marker onto markerArray
  markerArray.push(marker);
  centerArray.push(marker);

  //redefine bounds to include all current markers
  var bounds = new google.maps.LatLngBounds();

  for(j = 0; j < centerArray.length; j++) {
    bounds.extend(centerArray[j].getPosition());
  }
  if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }
  //apply new bounds to map
  map.fitBounds(bounds);

};

$(function(){
  $('#setOrigin').on('click', function () {
    if($("#setOrigin").hasClass('deslctYlw')){
      $("#setOrigin").toggleClass('slctYlw');
      $("#setOrigin").toggleClass('deslctYlw');
      $("#gpsBtn").toggleClass('deslctYlw');
      $("#gpsBtn").toggleClass('slctYlw');
    }
  });
});

$(function(){
  $('#gpsBtn').on('click', function () {
    if($("#gpsBtn").hasClass('deslctYlw')){
      $("#gpsBtn").toggleClass('deslctYlw');
      $("#gpsBtn").toggleClass('slctYlw');
      $("#setOrigin").toggleClass('slctYlw');
      $("#setOrigin").toggleClass('deslctYlw');
    }
  });
});

function calcRoute() {
  var request = {
    origin: originForExport,
    destination: originForExport,
    waypoints: waypointsArray,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  };
  if(!originForExport){
    $('#origin').modal('show');
  }else if(markerArray.length === 0){
    $('#locationNameInput').focus();
  }else{
    for(var i = 0; i < markerArray.length; i++){
      markerArray[i].setVisible(false)
    }
    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    })
  }
};

function computeTotalDistance(result) {
  var total = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000.0;
  document.getElementById('total').innerHTML = total + ' km';
}

function geoLocate(){
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': pos}, function(results, status) {
       marker = new google.maps.Marker({
         animation : google.maps.Animation.DROP,
         map       : map,
         position  : pos,
         label: 'origin'
       });

      locationID = results[0].formatted_address;
      originPointModel.set('originName',locationID);
      originPointModel.save();
      originForExport = locationID;

      for(i = 0; i < centerArray.length; i++) {
        //console.log(centerArray[i]);
        if(centerArray[i].label === 'origin'){
          centerArray[i].setMap(null);
          centerArray.splice(i, 1);
        }
      }
      centerArray.push(marker);
      var bounds = new google.maps.LatLngBounds();
      for(i = 0; i < centerArray.length; i++) {
        bounds.extend(centerArray[i].getPosition());
      }
      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.01, bounds.getNorthEast().lng() - 0.01);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);
    }
      map.fitBounds(bounds);
     });
   }), function() {
      handleNoGeolocation(true);
    };
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(45.5200, -122.6819),
    content: content
  };
};

google.maps.event.addDomListener(window, 'load', initialize);


//event listener on submit button in register form to validate input data
$(function(){

  var registerForm = document.getElementById('registerForm');

  registerForm.addEventListener("submit", function (event) {

    //prevent form from being submitted until data is verified
    event.preventDefault();

    //get inputs from form
    var registerUserName = registerForm["username"].value;
    var registerPassword = registerForm["password"].value;
    var registerPasswordVerification = registerForm["password_confirm"].value;
    //var registerEmail = registerForm["email"].value;
    
    // //check that email is valid format
    // if (!registerEmail.validity.valid) {
    //   alert("Please enter a valid email address");
    //   return false;
    // }

    //check that password and password verification match
    if(registerPassword !== registerPasswordVerification) {
      alert("Passwords Do Not Match");
      return false;
    }

    //send AJAX query to database to check if username already exists
    $.post("/checkUserName", {userName : registerUserName})
      .done(function (nameMatchCheck) {
        console.log('in .done from $.post');

        if (nameMatchCheck === "noNameMatch") {
          //submit form with jQuery
          $("#registerForm").submit();
        }

        if (nameMatchCheck === "nameExists") {
          // keep default event prevented, alert user of bad input
          alert("Username already in use, please select another");
        }
      })
    })
})

//event listener on login button in login form to validate input data
$(function(){

  var loginForm = document.getElementById('loginForm');

  loginForm.addEventListener("submit", function (event) {
    console.log("event in listener:")
    console.log(event)

    //prevent form from being submitted until data is verified
    event.preventDefault();

    //get inputs from form
    var loginUserName = loginForm["username"].value;
    var loginPassword = loginForm["password"].value;

    //send AJAX query to database to check if username already exists
    $.post("/checkUserName", {userName : loginUserName})
      .done(function (nameMatchCheck) {
        console.log('in .done from $.post');

        //name found in users db
        if (nameMatchCheck === "nameExists") {
          //check password
          $.post("/login", {username : loginUserName, password : loginPassword})
            .done(function (passMatchCheck) {
              if(passMatchCheck === "badPassword"){
                alert("incorrect password");
              } else {
                //submit form with jQuery
                $("#loginForm").submit();
              
              }
            })
        }    

        //name not found
        if (nameMatchCheck === "noNameMatch") {
          // keep default event prevented, alert user of bad input
          alert("Username not found");
        }

      })
    })
})

//prevent default behavior of enter key on login form modal from hiding the modal
$(function() {
  $("#loginForm").keypress(function(e) {
    if ((e.keyCode == 13) && (e.target.type != "textarea")) {
      e.preventDefault();
    }
  });
})

//prevent default behavior of enter key on register form modal from hiding the modal
$(function() {
  $("#registerForm").keypress(function(e) {
    if ((e.keyCode == 13) && (e.target.type != "textarea")) {
      e.preventDefault();
    }
  });
})


