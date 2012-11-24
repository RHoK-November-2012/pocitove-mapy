
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express',
        page: "index",
        user: req.session['user']
    });
};