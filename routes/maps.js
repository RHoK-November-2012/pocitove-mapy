
/*
 * GET home page.
 */

exports.add_routes = function(req, res){
    // TODO ...
    res.render('index', { title: 'Express', user: req.session['user'] });
};
