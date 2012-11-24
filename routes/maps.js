var shred = require("shred");

exports.add_routes = function(req, res){
	shred.get({
		url: "https://www.googleapis.com/fusiontables/v1/tables/17H2KNPhUpX244CDr6RFSzpJFvRG_zN-CpzkPYwY/columns?key=AIzaSyBmIHT_b4PoGIXOztnFkbU6KDgPIdeFqwE",
		headers: {
			Accept: "application/json"
		},
		on: {
			200: function (columns) {
				console.log(columns.content.data);
			}
		},
		response: function (response) {
			console.log("Fuck.");
		}
	});
};
