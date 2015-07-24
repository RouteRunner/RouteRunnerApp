var map,
    marker,
    markerArray = [],
    locationID,
    origin,
    input,
    searchbox,
    autocomplete,
    //tempAuto,
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

/*helper funciton to build new marker, if no place is passed in, marker is created
  by grabbing entry from autocomplete bar, if placeInput is passed in marker is created using
  lat,lng from that place object (JSON string)*/ 
function buildMarker(placeInput){
  console.log("in buildMarker");

  //check to see if placeInput has been provided
  if(!placeInput){
    //no input, get place info from autocomplete.getPlace() and assign to global place var
    place = autocomplete.getPlace();
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

  //redefine bounds to include all current markers
  var bounds = new google.maps.LatLngBounds();
  for(j = 0; j < markerArray.length; j++) {
    bounds.extend(markerArray[j].getPosition());
  }

  //apply new bounds to map
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
