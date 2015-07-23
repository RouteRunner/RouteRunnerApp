var map,
  marker,
  markerArray = [],
  locationID,
  origin,
  input,
  searchbox,
  autocomplete,
  tempAuto;


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
    mapOptions);

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  origin = (document.getElementById('originNameInput'));
  input = (document.getElementById('locationNameInput'));
  searchBox = new google.maps.places.SearchBox(input);

  autocomplete = new google.maps.places.Autocomplete(origin);
  autocomplete.bindTo('bounds', map);

  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  //geoLocate();

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    buildMarker();
  });

  google.maps.event.addListener(searchBox, 'places_changed', function() {
    buildMarker();
  });

}

function buildMarker(inputEl){
  console.log("in buildMarker");

  marker = new google.maps.Marker({
    animation: google.maps.Animation.DROP,
    map: map,
  });

  if(!inputEl){
    var place = autocomplete.getPlace();
  }else{
    tempAuto = new google.maps.places.Autocomplete(inputEl);
    var place = tempAuto.getPlace();
  }

  // Set the position of the marker using the place ID and location
  marker.setPlace({
    placeId: place.place_id,
    location: place.geometry.location,
  });
  marker.setVisible(false);
  markerArray.push(marker);

  var bounds = new google.maps.LatLngBounds();
  for(i = 0; i < markerArray.length; i++) {
    bounds.extend(markerArray[i].getPlace().location);
  }
  map.fitBounds(bounds);

};

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

// function geoLocate(){
//   if(navigator.geolocation) {
//         browserSupportFlag = true;
//         navigator.geolocation.getCurrentPosition(function(position) {
//           initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
//           var geocoder = geocoder = new google.maps.Geocoder();
//           locationID = geocoder.geocode({ 'location': initialLocation }, function (results, status) {
//             if (status == google.maps.GeocoderStatus.OK) {
//               if (results[1]) {
//                   locationID = results[1].formatted_address;
//                   originPointModel.setName(locationID);
//               }
//             }
//           });
//           initialLocationID = new geocoder.geocode({'location': initialLocation});
//           marker = new google.maps.Marker({
//             animation: google.maps.Animation.DROP,
//             map: map,
//             //position: initialLocation
//           });
//
//           //markerArray.push(marker);
//           map.setCenter(initialLocation);
//
//         }, function() {
//           handleNoGeolocation(browserSupportFlag);
//         });
//       }else {
//         browserSupportFlag = false;
//         handleNoGeolocation(browserSupportFlag);
//       }
//       function handleNoGeolocation(errorFlag) {
//         if (errorFlag == true) {
//           alert("Geolocation service failed.");
//           initialLocation = newyork;
//         } else {
//           alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
//           initialLocation = siberia;
//         }
//         map.setCenter(initialLocation);
//         console.log(initialLocation);
//       }
// };

google.maps.event.addDomListener(window, 'load', initialize);
