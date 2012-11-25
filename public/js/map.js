  var map;
  var markersArray = [];

//49.146991,14.174337&spn=0.017236,0.038581&t=m&z=15
  function initialize_map(latlng, zoom) {
    var myOptions = {
      zoom: zoom,
      center: new google.maps.LatLng(latlng.lat, latlng.lng),
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
var actualPolyline = undefined;
var actualPolygon = undefined;

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
    if (actualPolyline == undefined)
    {
      polyline = new google.maps.Polyline({
        path: [ location ],
        strokeColor: "blue",
        map: map
      });
      selected.polylines.push({
        path: [ location ],
        polyline: polyline
      });
      actualPolyline = selected.polylines[selected.polylines.length-1];
    }
    else
    {
      actualPolyline.path.push(location);
      actualPolyline.polyline.setPath(actualPolyline.path);
    }
  }
  else if (selectionMode === POLYGONS)
  {
    if (actualPolygon == undefined)
    {
      polygon = new google.maps.Polygon({
        path: [[location]],
        strokeColor: "red",
        map: map
      });
      selected.polygons.push({
        path: [location],
        polygon: polygon
      });
      actualPolygon = selected.polygons[selected.polygons.length-1];
    }
    else
    {
      actualPolygon.path.push(location);
      actualPolygon.polygon.setPath([actualPolygon.path]);
    }
  }

  updateJsonView();
}

function updateJsonView() {
  $("#jsonView").text(JSON.stringify(exportJson()));
}

function exportJson() {
  var expo = new Object();
  var whats = ["points", "polylines", "polygons"];
  for (what in whats)
  {
    what = whats[what];
    expo[what] = [];
    for (aThing in selected[what])
    {
      aThing = selected[what][aThing];
      if (what === "points")
      {
        expo[what].push({
          lat: aThing.location.lat(),
          lng: aThing.location.lng()
        });
      }
      else
      {
        expo[what].push(aThing.path.map(function (o) {
          return {
            lat: o.lat(),
            lng: o.lng()
          }
        }));
      }
    }
  }
  return expo;
}