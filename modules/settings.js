exports.MONGO_URI = process.env.MONGO_URI || process.env.MONGOLAB_URI
exports.BASE_URI = process.env.BASE_URI || "http://localhost:3000"
exports.BASE_URI_EXTERNAL = process.env.BASE_URI_EXTERNAL || process.env.BASE_URI || 'please specify BASE_URI'

//
// env parameters should be specified either as
// 	- property in '.env' file (for local development - app is started by 'foreman start')
//	- or by command line for deployment on heroku
//		heroku config:add BASE_URI=http://pocitovemapy.....
//
