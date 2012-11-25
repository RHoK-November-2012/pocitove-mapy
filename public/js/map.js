  var map;
  var markersArray = [];

  function initialize_map(latlng, zoom) {
    var myOptions = {
      zoom: zoom,
      center: new google.maps.LatLng(latlng.lat, latlng.lng),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false
      ,
      styles: [
  {
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "stylers": [
      { "saturation": -75 }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "weight": 1 }
    ]
  }
]
    };
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    google.maps.event.addListener(map, 'click', function(event) {
      addMarker(event.latLng);
    });

    $(".saveCommentButton").live("click", function() {
      $ta = $(this).parent().parent().find("textarea");
      tIdToMarkers[$ta.attr("id")].text = $ta.val();
    });

    return map;
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

var actualFeeling = {
  id: undefined,
  color: undefined
}

tIdToMarkers = {};
tId = 0;

function addMarker(location) {
  if (selectionMode === POINTS)
  {
    // thanks to http://stackoverflow.com/questions/7095574/google-maps-api-3-custom-marker-color-for-default-dot-marker
    var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + actualFeeling.color.substring(1),
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));

    var marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: pinImage,
      shadow: pinShadow,
      clickable: true,
      draggable: true
    });
    var pointO = {
      location: location,
      feeling: actualFeeling.id,
      marker: marker
    };

    tId++;
    tIdToMarkers["t" + tId] = pointO;

    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, "click", function() {
      infoWindow.setContent("<textarea id='t" + tId + "'>" + (pointO.text ? pointO.text : "") + "</textarea><div style='text-align:right'><button class='saveCommentButton'>Uložit</button></div>");
      infoWindow.open(map, this);
    });

    selected.points.push(pointO);
  }
  else if (selectionMode === POLYLINES)
  {
    if (actualPolyline == undefined)
    {
      polyline = new google.maps.Polyline({
        path: [ location ],
        strokeColor: actualFeeling.color,
        map: map
      });
      selected.polylines.push({
        path: [ location ],
        feeling: actualFeeling.id,
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
        strokeColor: actualFeeling.color,
        map: map
      });
      selected.polygons.push({
        path: [location],
        feeling: actualFeeling.id,
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
}

function setFeeling(i, color) {
  actualFeeling = {
    id: i,
    color: color
  };
};

function exportJson() {
  return {
    shapes: exportShapes(),
    answers: exportAnswers()
  };
}

function exportShapes() {
  var shapes = new Object();
  var shapeNames = ["points", "polylines", "polygons"];
  for (shapeName in shapeNames)
  {
    shapeName = shapeNames[shapeName];
    shapes[shapeName] = [];
    for (aThing in selected[shapeName])
    {
      aThing = selected[shapeName][aThing];
      console.log(aThing);
      if (shapeName === "points")
      {
        shapes[shapeName].push({
          lat: aThing.location.lat(),
          lng: aThing.location.lng(),
          text: aThing.text,
          feeling: aThing.feeling,
          color: model.feelings[aThing.feeling].color
        });
      }
      else
      {
        shapes[shapeName].push({
            path: aThing.path.map(function (o) {
              return {
                lat: o.lat(),
                lng: o.lng()
              }
            }),
            feeling: aThing.feeling,
            text: aThing.text ? aThing.text : ""
        });
      }
    }
  }
  return shapes;
}

function exportAnswers() {
  answers = new Object();
  for (var i=0; i<model.criteria.length; i++)
  {
    if (model.criteria.type === "text")
    {
      answers[i] = $("criterion" + i).val();
    }
    else
    {
      answers[i] = $("criterion" + i).val();
    }
  }
  return answers;
}