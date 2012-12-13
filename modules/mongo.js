var mongo = require('mongoskin');
var settings = require('./settings');

console.log("mongo uri: " + settings.MONGO_URI)
exports.db = mongo.db(settings.MONGO_URI, {safe: true})
