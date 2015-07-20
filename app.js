var map;
var marker;
var markerArray = [];

var rendererOptions = {
  draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();

function initialize() {
  var mapOptions = {
    center: {lat: 45.5200, lng: -122.6819},
    zoom: 12,
    maxZoom: 12
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions, { maxZoom: 10 });

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  var origin = (document.getElementById('originNameInput'));
  var input = (document.getElementById('locationNameInput'));

  var autocomplete = new google.maps.places.Autocomplete(origin);
  autocomplete.bindTo('bounds', map);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    marker = new google.maps.Marker({
      animation: google.maps.Animation.DROP,
      map: map,
    });

    var infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
    });
    infowindow.close();

    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);

    }

    // Set the position of the marker using the place ID and location
    marker.setPlace(/** @type {!google.maps.Place} */ ({
      placeId: place.place_id,
      location: place.geometry.location,
    }));
    marker.setVisible(false);

    infowindow.setContent('<div><b>' + place.name + '</b></div>' + '<br>' + place.formatted_address + '<br>');

    markerArray.push(marker);

//Implementation of this is causing the error
    var bounds = new google.maps.LatLngBounds();
    for(i = 0; i < markerArray.length; i++) {
      bounds.extend(markerArray[i].getPlace().location);
    }
    map.fitBounds(bounds);

  });
}

// function addWaypoint() {
//   var bounds = new google.maps.LatLngBounds();
//   console.log("addWaypoint successfully called")
//   for(i = 0; i < markerArray.length; i++) {
//     bounds.extend(markerArray[i].getPlace().location);
//   }
//   map.fitBounds(bounds);
// };
//
// $(function(){
//   $('#setOrigin').on('click', function (e) {
//     addWaypoint();
//   });
// });

$(function(){
  $('#routeIt').on('click', function (e) {
    calcRoute();
    for(var i =0; i<markerArray.length; i++){
      markerArray[i].setVisible(false)
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

  directionsService.route(request, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);

    }
  });
}

function computeTotalDistance(result) {
  var total = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000.0;
  document.getElementById('total').innerHTML = total + ' km';
}

google.maps.event.addDomListener(window, 'load', initialize);
