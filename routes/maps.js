maps = require("mongoskin").db('localhost:27017/pomapy').collection('maps');

// /maps
exports.show = function(req, res) {
	maps.find().toArray(function(err, maps) {
		res.render('mapList', {
			title: 'Atlas map',
			page: 'mapList',
			user: req.session['user'],
			model: maps
		});
	});
};

// /maps/:mapId
exports.show = function(req, res) {
	maps.findOne({ "_id": req.param("mapId") }, function (map) {
		res.render('mapShow', {
			title: 'Prohlížení mapy',
			page: 'mapShow',
			user: req.session['user'],
			model: map
		});
	});
};

// /maps/:mapId/fill
exports.fill = function(req, res) {
	maps.findOne({ "_id": req.param("mapId") }, function (map) {
		res.render('mapFill', {
			title: 'Vyplňování mapy',
        	page: 'mapFill',
        	user: req.session['user'],
        	model: map
    	});
	});
};

// /maps/save
exports.save = function(req, res) {
	res.send(req.body);
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
	maps.findOne({ "_id": req.param("mapId") }, function (map) {
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
    res.send(req.body);
};