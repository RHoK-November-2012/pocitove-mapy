mongo = require('../modules/mongo');
crypto = require('crypto');

users = mongo.db.collection('users');

/*
 * GET users listing.
 */

exports.list = function(req, res) {
    res.send("respond with a resource");
};

exports.login = function(req, res) {
    var email = req.body.email.toLowerCase();
    var password = req.body.password;

    var hash = hash_password(email, password);
    users.findOne({email: email, password: hash}, function (err, user) {
        if (err) {
            // TODO(davidmarek): Dodelat kontrolu chyb.
        }

        if (user) {
            req.session['user'] = email;
            res.redirect('/');
        } else {
            // TODO(davidmarek): Dodelat ukazani chyb.
            res.redirect('back');
        }
    });
}

exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('back');
}

exports.get_register = function(req, res) {
    res.render("register", { title: "Registrace",
        page: "register",
        user: req.session['user']
    });
};

exports.post_register = function(req, res) {
    var email = req.body.email.toLowerCase();
    var password = req.body.password;

    users.findOne({email: email}, function (err, user) {
        if (err) {
            // TODO(davidmarek): Dodelat kontrolu chyb.
        }

        if (user) {
            // TODO(davidmarek): Dodelat ukazani chyb.
            res.redirect('back');
        } else {
            var hash = hash_password(email, password);

            users.insert({
                email: email,
                password: hash,
            }, function (err, result) {
                // TODO(davidmarek): Dodelat kontrolu chyb.
                req.session['user'] = email
                res.redirect('/');
            });
        }
    });
}

function hash_password(salt, password) {
    var shasum = crypto.createHash('sha1');
    shasum.update(salt);
    shasum.update(password);
    return shasum.digest('hex');
}