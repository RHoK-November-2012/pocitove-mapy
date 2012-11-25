settings = require('../modules/settings');
db = require("mongoskin").db(settings.MONGO_URI, {safe: true});
maps = db.collection('maps');

// /maps
exports.list = function(req, res) {
	maps.find().toArray(function(err, maps) {
		res.render('mapList', {
			title: 'Seznam map',
			page: 'mapList',
			user: req.session['user'],
			model: maps
		});
	});
};

// /maps/:mapId/show
exports.show = function(req, res) {
	maps.findById(req.params.mapId, function (map) {
		res.render('mapShow', {
			title: 'Prohlížení mapy',
			page: 'mapShow',
			user: req.session['user'],
			mapId: req.params.mapId,
			model: map
		});
	});
};

// /maps/:mapId/fill
exports.fill = function(req, res) {
	maps.findById(req.params.mapId, function (map) {
		res.render('mapFill', {
			title: 'Vyplňování mapy',
        	page: 'mapFill',
        	user: req.session['user'],
        	model: map
    	});
	});
};

// /maps/:mapId/save
exports.save = function(req, res) {
	db.collection('fillIns').insert({
		map: req.params.mapId,
		dateTime: new Date(),
		ip: req.connection.remoteAddress,
		shapes: req.body.shapes
	}, function() {
		res.send({
			result: "ok"
		});
	});
};

// /maps/design
exports.design = function(req, res){
	res.render('mapDesign', {
		title: 'Návrh nové mapy',
		page: 'mapDesign',
		user: req.session['user']
	});
};

// /maps/:mapId/edit
exports.edit = function(req, res) {
	maps.findById(req.params.mapId, function (map) {
		res.render('mapDesign', {
			title: 'Úprava existující mapy',
			page: 'mapDesign',
			user: req.session['user'],
			model: map
		});
	});
};

// /maps/create
exports.create = function(req, res) {
    var feelings = [];
    var criteria = [];

    for (var i = 0; i < req.body.color.length; i++) {
        var feeling = {
            color: req.body.color[i],
            text: req.body.feeling[i]
        }
        feelings.push(feeling);
    }

    if (req.body.criterion)
    {
	    for (var i = 0; i < req.body.criterion.length; i++) {
	        var criterion = {
	            text: req.body.criterion[i],
	            type: req.body.criterion_type[i],
	            options: req.body.criterion_values[i].split(/\s+/)
	        };
	        criteria.push(criterion);
	    };
	};

    var latlon = req.body.latlon.slice(1, req.body.latlon.length-1).split(/[\s,]+/);

    var map = {
        title: req.body.title,
        comment: req.body.comment,
        creator: req.session['user'],
        feelings: feelings,
        criteria: criteria,
        public: req.body.public == "on",
        start: new Date(req.body.start),
        end: new Date(req.body.end),
        latlon: latlon,
        zoom: req.body.zoom
    };
    maps.insert(map, function() {
    	res.redirect(settings.BASE_URI + "/maps");	
    });
}