var Shred = require("shred");
var settings = require("../settings")

var refreshToken = "1/vnMrepdzMQre0DrplS4GKGR9O26ms7vWDbNNohCXR10",
    accessToken = "ya29.AHES6ZQIWkoRNE2XB0c-IM6diPECREqyjp5LmyWXoVhL-A2jzgpyMA";

exports.fill_map = function(req, res){
	res.render('mapFill', { title: 'mapFill',
        page: "mapFill",
        user: req.session['user']
    });
}

exports.add_shapes = function(req, res){
	shred = new Shred();
	shred.get({
		url: "https://www.googleapis.com/fusiontables/v1/tables/1oCQQe8yjW0_lKazb-j1jBmrA5hun09aubNjxVrA/columns",
		headers: {
			Accept: "application/json",
			"Authorization": "OAuth " + settings.ACCESS
		},
		on: {
			200: function (columns) {
				console.log(columns.content.data);
			},
			response: function (response) {
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
							exports.add_shapes(req, res);
						},
						response: function(response) {
							console.log("Oh, fuck.");
						}
					}
				});
			}
		}
	});
};

