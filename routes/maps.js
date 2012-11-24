var Shred = require("shred");
var settings = require("../settings")

exports.fill_map = function(req, res){
	res.render('mapFill', { title: 'mapFill',
        page: "mapFill",
        user: req.session['user']
    });
}

// Later, we will get this ID from Mongo:
var theTableId = "1oCQQe8yjW0_lKazb-j1jBmrA5hun09aubNjxVrA"

exports.add_shapes = function(req, res){
	make_query("https://www.googleapis.com/fusiontables/v1/query",
		"INSERT INTO '" + theTableId + "' (Submission) VALUES ('" + make_kml(req.body.submission) + "')",
		function () {
			res.write("ok.");
			res.end();
		})
	// "https://www.googleapis.com/fusiontables/v1/tables/1oCQQe8yjW0_lKazb-j1jBmrA5hun09aubNjxVrA/columns"
};

function make_kml(inputJson)
{
	kml = "";
	if (inputJson.points)
	{
		for (var i=0; i<inputJson.points.length; i++)
		{
			point = inputJson.points[i];
			kml += "<Point><coordinates>" + point.lat + "," + point.lng + "</coordinates></Point>";
		}
	}
	if (inputJson.polylines)
	{
		for (var i=0; i<inputJson.polylines.length; i++)
		{
			polyline = inputJson.polylines[i];
			kml += "<Polygon><outerBoundaryIs><LinearRing><coordinates>" + polyline.map(function(o){ o.lat + "," + o.lng }).join(" ") + "</coordinates></LinearRing></outerBoundaryIs></Polygon>";
		}
	}
	if (inputJson.polygons)
	{
		for (var i=0; i<inputJson.polygons.length; i++)
		{
			polygon = inputJson.polygons[i];
			kml += "<MultiGeometry><LineString><coordinates>" + polygons.map(function(o){ o.lat + "," + o.lng}).join(" ") + "</coordinates></LineString></MultiGeometry>";
		}
	}
	return kml;
}

function make_query(url, post, callback, repeatedCall)
{
	shred = new Shred();
	config = {
		url: url,
		headers: {
			Accept: "application/json",
			"Authorization": "OAuth " + settings.ACCESS
		},
		on: {
			200: function (response) {
				callback(response.content.data);
			},
			response: function (response) {
				if (repeatedCall)
				{
					console.log("I've got a new token, but I still cannot authenticate.");
					return;
				}
				console.log("I guess I have to refresh my token. What a drag.");

				shred.post({
					url: "https://accounts.google.com/o/oauth2/token",
					content: {
						"client_id": settings.CLIENTID,
						"client_secret": settings.CLIENTSECRET,
						"refresh_token": settings.REFRESH,
						"grant_type": "refresh_token"
					},
					on: {
						200: function (token) {
							settings.ACCESS = token.content.data;
							make_query(url, callback, true);
						},
						response: function(response) {
							console.log("I have not been able to obtain new token. Giving up.");
						}
					}
				});
			}
		}
    };
    if (!post)
    {
        shred.get(config);
    }
    else
    {
        config.content = post;
        shred.post(config);
    }
}

exports.get_new_map = function(req, res) {
    if (req.session['user']) {
        res.render('new_map', { title: "Vytvoření nové mapy",
            page: "new_map",
            user: req.session['user']
        });
    } else {
        // TODO(davidmarek): Dodelat stranku pro login.
        res.redirect('/login');
    }
}

exports.post_new_map = function(req, res) {
    console.log(req.body);
    res.send(req.body);
}