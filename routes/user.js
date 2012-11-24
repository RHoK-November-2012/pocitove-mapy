mongo = require('../modules/mongo');
crypto = require('crypto');

users = mongo.db.collection('users');

/*
 * GET users listing.
 */

exports.list = function(req, res) {
    res.send("respond with a resource");
};

exports.get_register = function(req, res) {
    res.render("register", { title: "Registrace" })
};

exports.post_register = function(req, res) {
    email = req.body.email.toLowerCase();
    password = req.body.password;

    users.findOne({email: email}, function (err, user) {
        if (err) {
            // TODO(davidmarek): Dodelat kontrolu chyb.
        }

        if (user) {
            // TODO(davidmarek): Dodelat ukazani chyb.
            res.redirect('back');
        } else {
            hash = hash_password(email, password);

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
    shasum = crypto.createHash('sha1');
    shasum.update(salt);
    shasum.update(password);
    return shasum.digest('hex');
}