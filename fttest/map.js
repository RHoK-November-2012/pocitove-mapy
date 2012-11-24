  var map;
  var markersArray = [];

//49.146991,14.174337&spn=0.017236,0.038581&t=m&z=15
  function initialize() {
    var myOptions = {
      zoom: 15,
      center: new google.maps.LatLng(49.146991, 14.174336),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "landscape.natural",
          stylers: [
            { color: "#ffffff" }
          ]
        },{
          featureType: "administrative",
          elementType: "geometry",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative",
          elementType: "labels.text",
          stylers: [
            { visibility: "off" },
          ]
        },{
          featureType: "administrative.country",
          elementType: "geometry",
          stylers: [
            { weight: 1 },
            { visibility: "on" },
            { color: "#010100" }
          ]
        },{
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [
            { weight: 0.7 },
            { color: "#006464" }
          ]
        },{
          featureType: "road",
          elementType: "labels.icon",
          stylers: [
            { visibility: "off" }
          ]
        },{
          elementType: "labels.text",
          stylers: [
            { visibility: "off" },
            { color: "#ffffff" }
          ]
        },{
          featureType: "landscape",
          elementType: "labels.text",
          stylers: [
            { visibility: "off" },
            { color: "#007575" }
          ]
        },{
          featureType: "poi",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "administrative.land_parcel",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "poi.park",
          stylers: [
            { visibility: "on" }
          ]
        },{
          featureType: "poi.park",
          elementType: "labels.icon",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "transit",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "water",
          elementType: "geometry",
          stylers: [
            { color: "#007575" }
          ]
        },{
          featureType: "poi.park",
          elementType: "geometry.fill",
          stylers: [
            { color: "#eeeeee" }
          ]
        },{
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [
            { visibility: "off" },
            { color: "#ffffff" },
            { weight: 3 }
          ]
        },{
          featureType: "road",
          elementType: "labels.text",
          stylers: [
            { visibility: "off" },
            { color: "#ffffff" },
            { weight: 3 }
          ]
        },{
          featureType: "transit",
          stylers: [
            { weight: 0.5 },
            { color: "#007575" }
          ]
        },{
          featureType: "road",
          elementType: "labels.icon",
          stylers: [
            { visibility: "off" }
          ]
        },{
          featureType: "road.highway",
          elementType: "geometry.fill",
          stylers: [
            { weight: 2 }
          ]
        },{
          featureType: "road.arterial",
          elementType: "geometry.fill",
          stylers: [
            { weight: 1.3 }
          ]
        }
      ]
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    google.maps.event.addListener(map, 'click', function(event) {
      addMarker(event.latLng);
    });
  }

var selected =
{
  points: [],
  polylines: [],
  polygons: []
};

var POINTS = 0,
    POLYLINES = 1,
    POLYGONS = 2;
var selectionMode = POINTS;

function addMarker(location) {
  if (selectionMode === POINTS)
  {
    marker = new google.maps.Marker({
      position: location,
      map: map
    });
    selected.points.push({
      location: location,
      marker: marker
    });
  }
  else if (selectionMode === POLYLINES)
  {
    polyline = new google.maps.Polyline({

    });
  }
}

$(document).ready(function () {
  initialize();

  $("#pointSelect").addClass("sel");
  $("#pointSelect").click(function() {
    selectionMode = POINTS;
    $("button").removeClass("sel");
    $("#pointSelect").addClass("sel");
  });
  $("#polylineSelect").click(function() {
    selectionMode = POLYLINES;
    $("button").removeClass("sel");
    $("#polylineSelect").addClass("sel");
  });
  $("#polygonSelect").click(function() {
    selectionMode = POLYGONS;
    $("button").removeClass("sel");
    $("#polygonSelect").addClass("sel");
  });
});