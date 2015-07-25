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
  add,
  origin,
  browserSupportFlag =  new Boolean(),
  place;

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
    maxZoom: 12
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  originBtn = (document.getElementById('originSubmit'));
  addBtn = (document.getElementById('addBtn'));
  gpsBtn = (document.getElementById('gpsBtn'));
  origin = (document.getElementById('originNameInput'));
  input = (document.getElementById('locationNameInput'));
  searchBox = new google.maps.places.SearchBox(input);

  autoOrigin = new google.maps.places.Autocomplete(origin);
  autoOrigin.bindTo('bounds', map);

  autoInput = new google.maps.places.Autocomplete(input);
  autoInput.bindTo('bounds', map);

  google.maps.event.addDomListener(addBtn, 'click', function(){
    buildMarker();
  });

  google.maps.event.addDomListener(gpsBtn, 'click', geoLocate);

  google.maps.event.addDomListener(originBtn, 'click', function(){
    var place = autoOrigin.getPlace();

    marker = new google.maps.Marker({
      animation : google.maps.Animation.DROP,
      map       : map,
      position  : {lat : place.geometry.location.A, lng : place.geometry.location.F},
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
  }else{
    //input provided, assign passed in place object to global place var
    place = JSON.parse(placeInput);
  }

  //create new marker, using location info from global place object
  marker = new google.maps.Marker({
    animation : google.maps.Animation.DROP,
    map       : map,
    position  : {lat : place.geometry.location.A, lng : place.geometry.location.F},
  });

  //push new marker onto markerArray
  markerArray.push(marker);
  centerArray.push(marker);

  //redefine bounds to include all current markers
  var bounds = new google.maps.LatLngBounds();

  for(j = 0; j < centerArray.length; j++) {
    bounds.extend(centerArray[j].getPosition());
  }
  //apply new bounds to map
  map.fitBounds(bounds);

};

$(function(){
  $('#routeIt').on('click', function (e) {
    calcRoute();
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
      originPointModel.setName(locationID);

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
