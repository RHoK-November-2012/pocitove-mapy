var Shred = require("shred");
var settings = require("../settings")

exports.fill_map = function(req, res){
	res.render('mapFill', { title: 'mapFill',
        page: "mapFill",
        user: req.session['user']
    });
}

exports.add_shapes = function(req, res){
	// "https://www.googleapis.com/fusiontables/v1/tables/1oCQQe8yjW0_lKazb-j1jBmrA5hun09aubNjxVrA/columns"	
};

function make_query(url, callback, repeatedCall)
{
	shred = new Shred();
	shred.get({
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
	});
}