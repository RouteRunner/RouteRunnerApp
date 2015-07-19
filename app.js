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
    // center: {lat:}
    zoom: 8
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

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
    map: map

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
  // console.log(place)
  if (place.geometry.viewport) {
    map.fitBounds(place.geometry.viewport);
    // console.log(map.fitBounds)
  } else {
    map.setCenter(place.geometry.location);
    console.log(map.setCenter)
    // map.setZoom(8);
  }

   marker.setPlace(/** @type {!google.maps.Place} */ ({
    placeId: place.place_id,
    location: place.geometry.location,

  }));
  marker.setVisible(false);
  // marker.setVisible(false);

  infowindow.setContent('<div><b>' + place.name + '</b></div>' + '<br>' + place.formatted_address + '<br>');

  markerArray.push(marker.place.location);

  var lats = markerArray.map(function(val){
    return val.A;
  })
  var longs = markerArray.map(function(val){
    return val.F;
  })

  var latMax = Math.max(lats);
  var latMin = Math.min(lats);
  var longMax = Math.max(longs);
  var longMin = Math.min(longs);

  var mapBoundaries = new google.maps.LatLngBounds(swObject, neObject, false);

  var swObject = new google.maps.LatLng(latMin, longMin, false);
  var neObject = new google.maps.LatLng(latMax, longMax, false);

  console.log(longs)
  console.log(markerArray);
  console.log(longMin);
  console.log(swObject);
  console.log(mapBoundaries);
  console.log(place.geometry.viewport);

  });
};

// function addWaypoint () {
//
// };

// $(function(){
//   $('#addBtn').on('click', function (e) {
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
