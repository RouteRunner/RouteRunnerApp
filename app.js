var rendererOptions = {
  draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();
var map;
var geocoder;


// var oregon = new google.maps.LatLng(40.0000, -120.5000);

function initialize() {

  var mapOptions = {
    zoom: 8,
    // center: portland,or
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
    computeTotalDistance(directionsDisplay.getDirections());
  });

  calcRoute();
}

function calcRoute() {

  var request = {
    origin: 'portland,Or',
    destination: 'portland,Or',
    waypoints:[{location: 'wal-mart salem,or'}, {location: 'dallas,or'}],
    travelMode: google.maps.TravelMode.DRIVING,
    optimizeWaypoints: true
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
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

//new geocode thingy
function codeAddress() {
 var address = document.getElementById('address').value;
 geocoder.geocode( { 'address': address}, function(results, status) {
   if (status == google.maps.GeocoderStatus.OK) {
     map.setCenter(results[0].geometry.location);
     var marker = new google.maps.Marker({
         map: map,
         position: results[0].geometry.location
     });
   } else {
     alert('Geocode was not successful for the following reason: ' + status);
   }
 });
}

google.maps.event.addDomListener(window, 'load', initialize);