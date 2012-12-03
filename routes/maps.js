var settings = require('../modules/settings');

var db = require("mongoskin").db(settings.MONGO_URI, {safe: true});
var sanitize = require("validator").sanitize;
var ejs = require('ejs');

var maps = db.collection('maps');
var fillIns = db.collection('fillIns');


// /maps
exports.list = function(req, res) {
	maps.find({
        "$or": [{
            "creator": req.session['user']
        },
        {
            "public": true,
        }]
    }).toArray(function(err, maps) {
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
    fillIns.find({map: req.params.mapId}).toArray(function (err, fs) {
        var points = [];
        var lines = [];
        var polygons = [];

        for (var i = 0; i < fs.length; i++) {
            if ('points' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['points'].length; j++) {
                    points.push(JSON.stringify(fs[i]['shapes']['points'][j]));
                }
            }
        }

        for (var i = 0; i < fs.length; i++) {
            if ('polylines' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['polylines'].length; j++) {
                    lines.push(JSON.stringify(fs[i]['shapes']['polylines'][j]));
                }
            }
        }

        for (var i = 0; i < fs.length; i++) {
            if ('polygons' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['polygons'].length; j++) {
                    polygons.push(JSON.stringify(fs[i]['shapes']['polygons'][j]));
                }
            }
        }

        maps.findById(req.params.mapId, function (err, map) {
            res.render('mapShow', {
                title: 'Prohlížení mapy',
                page: 'mapShow',
                user: req.session['user'],
                mapId: req.params.mapId,
                model: map,
                points: points,
                lines: lines,
                polygons: polygons,
            });
        });
    });
};

exports.create_kml = function(req, res) {
    var style_template = '\
\n<Style id="<%= id %>">\
\n    <IconStyle>\
\n        <color>3f<%= color %></color>\
\n        <colorMode>normal</colorMode>\
\n        <scale>1</scale>\
\n        <heading>0</heading>\
\n        <Icon>\
\n            <href>http://pocitovamapa.herokuapp.com/img/point.png</href>\
\n        </Icon>\
\n        <hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/>\
\n    </IconStyle>\
\n    <LineStyle>\
\n        <color>3f<%= color %></color>\
\n        <colorMode>normal</colorMode>\
\n        <width>2</width>\
\n    </LineStyle>\
\n    <PolyStyle>\
\n        <color>10<%= color %></color>\
\n        <colorMode>normal</colorMode>\
\n        <fill>1</fill>\
\n        <outline>0</outline>\
\n    </PolyStyle>\
\n</Style>'

    var point_template = '\
\n<Placemark>\
\n    <name><%= name %></name>\
\n    <styleUrl>#<%= styleUrl %></styleUrl>\
\n    <Point>\
\n        <coordinates><%= lon %>,<%= lat %></coordinates>\
\n    </Point>\
\n</Placemark>'

    var line_template = '\
\n<Placemark>\
\n    <name><%= name %></name>\
\n    <styleUrl>#<%= styleUrl %></styleUrl>\
\n    <LineString>\
\n        <coordinates>\
\n<%= coordinates %>\
\n        </coordinates>\
\n    </LineString>\
\n</Placemark>'

    var polygon_template = '\
\n<Placemark>\
\n    <name><%= name %></name>\
\n    <styleUrl>#<%= styleUrl %></styleUrl>\
\n    <Polygon>\
\n        <outerBoundaryIs>\
\n            <LinearRing>\
\n                <coordinates>\
\n<%= coordinates %>\
\n                </coordinates>\
\n            </LinearRing>\
\n        </outerBoundaryIs>\
\n    </Polygon>\
\n</Placemark>'

    var xml = '<?xml version="1.0" encoding="UTF-8"?>\
\n<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">\
\n<Document>'

    maps.findById(req.params.mapId, function (err, map) {
        for (var i = 0; i < map.feelings.length; i++) {
            var color = map.feelings[i].color;
            xml += ejs.render(style_template, {
                id: "feeling" + i,
                color: color.substr(5, 2) + color.substr(3, 2) + color.substr(1, 2)
            });
        }
        xml += "<Folder>";

        fillIns.find({map: req.params.mapId}).toArray(function (err, fs) {
            for (var i = 0; i < fs.length; i++) {
                if ('points' in fs[i].shapes) {
                    var points = fs[i].shapes.points;
                    for (var j = 0; j < points.length; j++) {
                        xml += ejs.render(point_template, {
                            name: points[j].text ? points[j].text : "",
                            lat: points[j].lat,
                            lon: points[j].lng,
                            styleUrl: "feeling" + points[j].feeling
                        });
                    }
                }

                if ('polylines' in fs[i].shapes) {
                    var lines = fs[i].shapes.polylines;
                    for (var j = 0; j < lines.length; j++) {
                        var coordinates = "";
                        for (var k = 0; k < lines[j].path.length; k++) {
                            coordinates += lines[j].path[k].lng + "," + lines[j].path[k].lat + "\n";
                        }

                        xml += ejs.render(line_template, {
                            name: lines[j].text,
                            coordinates: coordinates,
                            styleUrl: "feeling" + lines[j].feeling
                        });
                    }
                }

                if ('polygons' in fs[i].shapes) {
                    var polygons = fs[i].shapes.polygons;
                    for (var j = 0; j < polygons.length; j++) {
                        var coordinates = "";
                        for (var k = 0; k < polygons[j].path.length; k++) {
                            coordinates += polygons[j].path[k].lng + "," + polygons[j].path[k].lat + "\n";
                        }
                        coordinates += polygons[j].path[0].lng + "," + polygons[j].path[0].lat + "\n";

                        xml += ejs.render(polygon_template, {
                            name: polygons[j].text,
                            coordinates: coordinates,
                            styleUrl: "feeling" + polygons[j].feeling
                        });
                    }
                }
            }
            xml += "</Folder></Document></kml>";
            res.send(xml);
        });
    });
}

// /maps/:mapId/fill
exports.fill = function(req, res) {
    fillIns.find({map: req.params.mapId}).toArray(function (err, fs) {
        var points = [];
        var lines = [];
        var polygons = [];

        for (var i = 0; i < fs.length; i++) {
            if ('points' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['points'].length; j++) {
                    points.push(JSON.stringify(fs[i]['shapes']['points'][j]));
                }
            }

            if ('polylines' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['polylines'].length; j++) {
                    lines.push(JSON.stringify(fs[i]['shapes']['polylines'][j]));
                }
            }

            if ('polygons' in fs[i]['shapes']) {
                for (var j = 0; j < fs[i]['shapes']['polygons'].length; j++) {
                    polygons.push(JSON.stringify(fs[i]['shapes']['polygons'][j]));
                }
            }
        }

    	maps.findById(req.params.mapId, function (err, map) {
    		res.render('mapFill', {
    			title: 'Vyplňování mapy ' + map.title,
            	page: 'mapFill',
            	user: req.session['user'],
            	mapId: req.params.mapId,
            	model: map,
                points: points,
                lines: lines,
                polygons: polygons,
        	});
    	});
    });
};

// /maps/:mapId/shapes
exports.shapes = function(req, res) {
	db.collection('fillIns').find({ map: req.params.mapId }).toArray(function (err, shapes) {
		res.send(shapes);
	});
};

// /maps/:mapId/save
exports.save = function(req, res) {
	db.collection('fillIns').insert({
		map: req.params.mapId,
		dateTime: new Date(),
		ip: req.connection.remoteAddress,
		shapes: req.body.shapes,
		answers: req.body.answers
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
    var comment = sanitize(req.body.comment).xss();

    var map = {
        title: req.body.title,
        comment: comment,
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