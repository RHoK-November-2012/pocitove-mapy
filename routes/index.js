exports.index = function(req, res){
    res.render('index', { title: 'Pocitová mapa',
        page: "index",
        user: req.session['user']
    });
};