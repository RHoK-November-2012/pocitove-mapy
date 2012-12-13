var im = require('imagemagick')

function zoomRange(pxls) {
	return Math.floor(Math.log(pxls)/Math.LN2
		- Math.log(256)/Math.LN2)
}

// prepare tiles from picture on path
function prepareTiles(picturePath, suffix, callback) {
	im.identify(['-format', '%wx%h', picturePath + 'original'], function(err, dimensions) {
		if (err) throw err

		console.log(dimensions)
		
		// get picture dimensions and desired zoom range
		var w = parseInt(dimensions.split('x')[0])
		var h = parseInt(dimensions.split('x')[1])

		var info = {
			zoomRange: Math.min(zoomRange(w), zoomRange(h)),
			tilesWidths: [],		// counts of tiles at various zoom levels
			tilesHeights: [],
			tilesWidth: Math.ceil(w / 256),
			tilesHeight: Math.ceil(h / 256),
			suffix: suffix
		}

		if (info.tilesWidth % 2 || info.tilesHeight % 2
			|| info.tilesWidth * 256 != w
			|| info.tilesHeight * 256 != h) {

			console.log('make padding')

			// make padding in order for tiles to be even
			info.tilesWidth += info.tilesWidth % 2
			info.tilesHeight += info.tilesHeight % 2

			var paddedW = info.tilesWidth * 256
			var paddedH = info.tilesHeight * 256
			var offsetW = Math.ceil((paddedW - w) / 2)
			var offsetH = Math.ceil((paddedH - h) / 2)

			var cmd = [
					picturePath + 'original',
					'-crop', 
					'' + paddedW + 'x' + paddedH + '-'
						+ offsetW + '-' + offsetH + '!',
					'-background',
					'#E5E3DF',
					'-flatten',
					picturePath + 'original-' + info.zoomRange
				]
			console.log(cmd)
			im.convert(cmd,
				function(err, stdout) {
					if (err) throw err
					console.log(stdout)

					// make tiles at all zoom levels
					splitAndScale(picturePath, info, info.zoomRange, null, callback)
				})			
		} else {

			// make tiles at all zoom levels - skip first padding
			splitAndScale(picturePath, info, info.zoomRange, picturePath + 'original', callback)
		}
	})
}

// split and scale (recursively until zoom 0)
function splitAndScale(picturePath, info, zoom, forcePath, callback) {
	var path = forcePath || picturePath + 'original-' + zoom

	console.log('split at ' + zoom)

	// record number of tiles at this zoom level (this information is exported)
	info.tilesWidths[zoom] = info.tilesWidth
	info.tilesHeights[zoom] = info.tilesHeight

	// split
	var cmd = [
			path,
			'-crop',
			'' + 256 + 'x' + 256,
			'+repage',
			'+adjoin',
			'-fill',
			'white',
			'-colorize',
			'40%',
			'-fill',
			'gray',
			'-colorize',
			'10%',
			picturePath + 'slices/' + zoom + '-%d' + info.suffix
		]
	console.log(cmd)
	im.convert(cmd,
		function(err, stdout) {
			if (err) throw err
			console.log(stdout)

			if (zoom > 0) {
				zoom--
				console.log('scale -> ' + zoom)

				var offsetH = 0
				var offsetW = 0

				// make padding if needed
				if (info.tilesWidth % 4) {
					var pad = 4 - info.tilesWidth % 4

					info.tilesWidth += pad
					offsetW = 128 * pad
				}
				if (info.tilesHeight % 4) {
					var pad = 4 - info.tilesHeight % 4

					info.tilesHeight += pad
					offsetH = 128 * pad
				}

				// compute size in pixels
				var width = info.tilesWidth << 8
				var height = info.tilesHeight << 8

				// zoom out
				info.tilesWidth /= 2
				info.tilesHeight /= 2

				// scale
				var cmd = [
						path,
						'-crop', 
						'' + width + 'x' + height + '-'
							+ offsetW + '-' + offsetH + '!',
						'-background',
						'#E5E3DF',
						'-flatten',
						'-scale',
						'50%',
						picturePath + 'original-' + zoom
					]
				console.log(cmd)
				im.convert(cmd,
					function(err, stdout) {
						if (err) throw err

						// and repeat process
						splitAndScale(picturePath, info, zoom, null, callback)
					})
			} else {
				console.log('split and scale finished')
				
				if (callback) {
					callback(info)
				}
			}
		})
}

// prepare thumbnail for overview of maps
function prepareThumbnail(picturePath) {
	im.convert(
		[
			picturePath + 'original',
			'-thumbnail',
			'600x400>',
			'-bordercolor',
			'#E5E3DF',
			'-border',
			'300',
			'-gravity',
			'center',
			'-crop',
			'600x400+0+0',
			'+repage',
			picturePath + 'thumbnail'
		],
		function(err, stdout) {
			if (err) throw err
			console.log(stdout)
			console.log('thumbnail created')
		})
}

exports.prepareTiles = prepareTiles
exports.prepareThumbnail = prepareThumbnail
