var conv = require('../routes/convert-utils')

// folder should contain 'original' file
conv.prepareTiles('tmp/elephant/', '', function(info) {
	console.log(JSON.stringify(info))
})