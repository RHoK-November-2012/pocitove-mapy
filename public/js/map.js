  var map;
  var drawingManager;
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

    $(".saveCommentButton").live("click", function() {
      $ta = $(this).parent().parent().find("textarea");
      tIdToMarkers[$ta.attr("id")].text = $ta.val();
    });

    $.getJSON("shapes", function(data) {
      for (var i=0; i<data.length; i++) {
        submit = data[i];
        if (submit.shapes.points)
        {
          for (var j=0; j<submit.shapes.points.length; j++){
            point = submit.shapes.points[j];
          }
        }
      }
      console.log(data);
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

function setFeeling(i, color) {
  actualFeeling = {
    id: i,
    color: color
  };
};

function exportJson() {
  var shapes = exportShapes();
  if (!shapes.points)
  {
    shapes.points = [];
  };
  if (!shapes.polylines)
  {
    shapes.polylines = [];
  };
  if (!shapes.polygons)
  {
    shapes.polygons = [];
  };
  console.log(shapes);
  return {
    shapes: shapes,
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
            color: model.feelings[aThing.feeling].color,
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