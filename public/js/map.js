  var map;
  var drawingManager;
  var markersArray = [];
  var infoWindows = {};

  // map based on custom images
  //  custompath - path to tiles of map
  function initialize_custom_map(latlng, zoom, custom) {
    var MIN_ZOOM = 10;
    var MAX_ZOOM = MIN_ZOOM + custom.zoomRange;

    var customTypeOptions = {
      getTileUrl: function(coord, zoom) {
          var normalizedCoord = getNormalizedCoord(coord, zoom);

          if (normalizedCoord) {
            return '/custommap/' + custom.path + '/slices/' + normalizedCoord  + custom.suffix
          }

          return null
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: MAX_ZOOM,
      minZoom: MIN_ZOOM,
      name: 'Custom'
    };

    var customMapType = new google.maps.ImageMapType(customTypeOptions);

    var mapOptions = {
      center: new google.maps.LatLng(latlng.lat, latlng.lng),
      zoom: zoom,
      streetViewControl: false,
      mapTypeControl: false,
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
    map.mapTypes.set('custom', customMapType);
    map.setMapTypeId('custom');

    // wrap prevention inspired by http://stackoverflow.com/questions/11411246/google-maps-api-v3-prevent-imagemaptype-from-wrapping
    function getNormalizedCoord(coord, zoom) {
      var myZoom = zoom - MIN_ZOOM
      var y = coord.y,
          x = coord.x;
      var originX = (1 << (zoom-1)),
          originY = (1 << (zoom-1));
      var tilesX = custom.tilesWidths[myZoom],
          tilesY = custom.tilesHeights[myZoom]
      var offsetX = tilesX / 2,
          offsetY = tilesY / 2

      if( x < originX - offsetX || x >= originX + offsetX ||
          y < originY - offsetY || y >= originY + offsetY ) {
          return null;
      }

      x = x - originX + offsetX;
      y = y - originY + offsetY;

      return '' + myZoom + '-' + (x + y * tilesX)
    }

    return map
  }

  // map based on google imagery
  function initialize_map(latlng, zoom) {
    var myOptions = {
      zoom: zoom,
      center: new google.maps.LatLng(latlng.lat, latlng.lng),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          "elementType": "labels",
          "stylers": [
            { "visibility": "off" }
          ]
        },
        {
          "stylers": [
            { "saturation": -75 }
          ]
        },
        {
          "featureType": "road",
          "stylers": [
            { "weight": 1 }
          ]
        }
      ]
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    return map;
  }

// save comments typed into info windows
$(".saveCommentButton").live("click", function() {
  $ta = $(this).parent().parent().find("textarea");
  var id = $ta.attr("id");
  tIdToMarkers[id].text = $ta.val();

  // close info window
  if (infoWindows[id]) {
    infoWindows[id].setMap(null)
    delete infoWindows[id]
  }
});

// popup info window for overlay (marker, polyline, polygon)
//   tmpId - id used for storing text upon save
//   overlayInfo - source of initial .text
//   position - place where infowindow should point to
function infoWindowPopuper(tmpId, overlayInfo, position) {
  var id = "t" + tmpId

  return function (ev) {
    var infoWindow = new google.maps.InfoWindow();

    // close others, already opened info windows
    for (var i in infoWindows) {
      infoWindows[i].setMap(null)
      delete infoWindow[i]
    }

    infoWindows[id] = infoWindow; // handle for closing

    infoWindow.setContent("<textarea id='" + id + "'>"
      + (overlayInfo.text ? overlayInfo.text : "")
      + "</textarea><div style='text-align:right'><button class='saveCommentButton' id='btn" + id + "'>Uložit</button></div>");
    infoWindow.setPosition(position)

    if (ev && ev.latLng) {
      infoWindow.setPosition(ev.latLng) // use position of click (polygon / polyline)
    }

    // show infowindow, provide marker if present (it's infowindow's friend)
    infoWindow.open(map, this.getPosition ? this : null);

    // focus and keyboard handlers hack 
    setTimeout(function() { 
      $edit = $("#" + id)
      $edit.focus()
      $edit.keydown(function (ev) {
        if (ev.keyCode == 27) { // ESC - hide
          infoWindows[id].setMap(null)
          delete infoWindows[id]
        } else if (ev.keyCode == 13) { // Enter - save
          if (!ev.shiftKey) { // allow inserting '\n' with shift+Enter
            $("#btn" + id).click()  // simulate save button click
          }
        }
      })
    }, 200); 
  }
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