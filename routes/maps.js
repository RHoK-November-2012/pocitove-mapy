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
	maps.findById(req.params.mapId, function (err, map) {
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
	maps.findById(req.params.mapId, function (err, map) {
		res.render('mapFill', {
			title: 'Vyplňování mapy ' + map.title,
        	page: 'mapFill',
        	user: req.session['user'],
        	mapId: req.params.mapId,
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
		user: req.session['user'],
        mapId: -1,
        model: {},
        default_criteria: [
            {
                text: "Pohlaví:",
                type: "select",
                options: ["muž", "žena"],
            },
            {
                text: "Rok narození:",
                type: "text",
                options: [],
            },
            {
                text: "Nejvyšší ukončené vzdělání:",
                type: "select",
                options: [
                    "základní bez vyučení",
                    "vyučení a střední odborné bez maturity",
                    "úplné střední s maturitou",
                    "vyšší odborné a nástavbové",
                    "vysokoškolské",
                ],
            },
            {
                text: "Současné ekonomické postavení:",
                type: "select",
                options: [
                    "zaměstnanec",
                    "soukromý podnikatel, živnostník",
                    "student",
                    "v domácnosti",
                    "důchodce",
                    "nezaměstnaný",
                ],
            },
            {
                text: "Jaký vztah mám k dané lokalitě:",
                type: "select",
                options: [
                    "bydlím v centru",
                    "bydlím vedle centra",
                    "bydlím na sídlišti",
                    "bydlím ve vilové čtvrti",
                    "bydlím za městem, obcí",
                    "bydlím uplně mimo zadanou oblast",
                ],
            }
        ]
	});
};

// /maps/:mapId/edit
exports.edit = function(req, res) {
	maps.findById(req.params.mapId, function (err, map) {
        if (map && map['creator'] == req.session['user']) {
    		res.render('mapDesign', {
    			title: 'Úprava existující mapy',
    			page: 'mapDesign',
    			user: req.session['user'],
    			mapId: req.params.mapId,
    			model: map,
                default_criteria: [],
    		});
        } else {
            res.redirect('/maps');
        }
	});
};

// /maps/create
exports.create = function(req, res) {
    if (!req.session['user']) {
        res.redirect('back');
        return;
    }

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
	            options: req.body.criterion_values[i].split(/[\r\n]+/)
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

    if (req.body.mapId != -1) {
        maps.findById(req.body.mapId, function(err, old_map) {
            if (old_map && old_map['creator'] == req.session['user']) {
                maps.updateById(req.body.mapId, map, function (err, map) {
                    console.log(err);
                    console.log(map);
                    res.redirect('/maps');
                });
            }
        });
    } else {
        maps.insert(map, function() {
        	res.redirect(settings.BASE_URI + "/maps");
        });
    }
}