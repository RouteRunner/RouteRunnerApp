var map;

var markerArray = [];

var rendererOptions = {
  draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();

function initialize() {
  var mapOptions = {
    center: {lat: 45.5200, lng: -122.6819},
    zoom: 10
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directionsPanel'));

  var george = (document.getElementById('originNameInput'));
  var tim = (document.getElementById('locationNameInput'));

  var autocomplete = new google.maps.places.Autocomplete(george);
  autocomplete.bindTo('bounds', map);

  var autocomplete = new google.maps.places.Autocomplete(tim);
  autocomplete.bindTo('bounds', map);

  

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var marker = new google.maps.Marker({
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

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(8);
    }

    // Set the position of the marker using the place ID and location
    marker.setPlace(/** @type {!google.maps.Place} */ ({
      placeId: place.place_id,
      location: place.geometry.location
    }));
    marker.setVisible(true);
    // marker.setVisible(false);

    infowindow.setContent('<div><b>' + place.name + '</b></div>' + '<br>' + place.formatted_address + '<br>');//where to add other things to info window
    infowindow.open(map, marker);
    
    // google.map.event.
    // markerArray[0].setVisible(false);

    markerArray.push(marker);


  });
  

}

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




































// <<<<<<< HEAD
// =======

// var waypoints = [];

// >>>>>>> dffcd01ab3821da941d70707660db34c44cdaee0
// var rendererOptions = {
//   draggable: true
// };
// var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
// var directionsService = new google.maps.DirectionsService();
// <<<<<<< HEAD
// var map;
// var geocoder;


// // var oregon = new google.maps.LatLng(40.0000, -120.5000);

// function initialize() {

//   var mapOptions = {
//     zoom: 8,
//     // center: portland,or
//   };
//   map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
//   directionsDisplay.setMap(map);
//   directionsDisplay.setPanel(document.getElementById('directionsPanel'));

//   google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
//     computeTotalDistance(directionsDisplay.getDirections());
//   });

//   calcRoute();
// }

// function calcRoute() {

//   var request = {
//     origin: 'portland,Or',
//     destination: 'portland,Or',
//     waypoints:[{location: 'wal-mart salem,or'}, {location: 'dallas,or'}],
//     travelMode: google.maps.TravelMode.DRIVING,
//     optimizeWaypoints: true
// =======

// function initialize() {
//   var mapOptions = {
//     center: {lat: 45.5200, lng: -122.6819},
//     zoom: 10
//   };
//   var map = new google.maps.Map(document.getElementById('map-canvas'),
//     mapOptions);

//   var input = /** @type {HTMLInputElement} */(
//       document.getElementById('destination'));

//   var autocomplete = new google.maps.places.Autocomplete(input);
//   autocomplete.bindTo('bounds', map);

//   // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

//   var infowindow = new google.maps.InfoWindow();
//   var marker = new google.maps.Marker({
//     map: map
//   });
//   google.maps.event.addListener(marker, 'click', function() {
//     infowindow.open(map, marker);
//   });

//   google.maps.event.addListener(autocomplete, 'place_changed', function() {
//     infowindow.close();
//     var place = autocomplete.getPlace();
//     if (!place.geometry) {
//       return;
//     }

//     if (place.geometry.viewport) {
//       map.fitBounds(place.geometry.viewport);
//     } else {
//       map.setCenter(place.geometry.location);
//       map.setZoom(8);
//     }

//     // Set the position of the marker using the place ID and location
//     marker.setPlace(/** @type {!google.maps.Place} */ ({
//       placeId: place.place_id,
//       location: place.geometry.location
//     }));
//     marker.setVisible(true);
//     waypoints.push({location:place.geometry.location});
//     console.log(waypoints);

//     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
//         place.formatted_address);
//     infowindow.open(map, marker);
//   });
// }

// $(function(){
//   $('#routeIt').on('click', function (e) {
//     alert("button be working!");
//     calcRoute();
//   });
// });

// function calcRoute() {

//   var request = {
//     origin: 'Bend, OR',
//     destination: 'Bend,OR',
//     waypoints: waypoints,
//     travelMode: google.maps.TravelMode.DRIVING
// >>>>>>> dffcd01ab3821da941d70707660db34c44cdaee0
//   };
//   directionsService.route(request, function(response, status) {
//     if (status == google.maps.DirectionsStatus.OK) {
//       directionsDisplay.setDirections(response);
//     }
//   });
// }

// function computeTotalDistance(result) {
//   var total = 0;
//   var myroute = result.routes[0];
//   for (var i = 0; i < myroute.legs.length; i++) {
//     total += myroute.legs[i].distance.value;
//   }
//   total = total / 1000.0;
//   document.getElementById('total').innerHTML = total + ' km';
// }

// <<<<<<< HEAD
// //new geocode thingy
// function codeAddress() {
//  var address = document.getElementById('address').value;
//  geocoder.geocode( { 'address': address}, function(results, status) {
//    if (status == google.maps.GeocoderStatus.OK) {
//      map.setCenter(results[0].geometry.location);
//      var marker = new google.maps.Marker({
//          map: map,
//          position: results[0].geometry.location
//      });
//    } else {
//      alert('Geocode was not successful for the following reason: ' + status);
//    }
//  });
// }

// google.maps.event.addDomListener(window, 'load', initialize);
// =======
// google.maps.event.addDomListener(window, 'load', initialize);
// >>>>>>> dffcd01ab3821da941d70707660db34c44cdaee0
