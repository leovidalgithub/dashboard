const builder = {};

builder.getResourceInfoById = (req, res, next, _id) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next("Cannot Connect");
			conn.query(`SELECT * FROM resources WHERE id = ${_id}`, (err, results) => {
				if(err) return next({msg: 'model.builder.builder.gateway.getResourceInfoById', error: err});
				resolve(results);
			})
		})
	})
}

builder.getURLsByResourceId = (req, res, next, _id) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next("Cannot Connect");
			conn.query(`SELECT url FROM resourcesMedia WHERE resources_id = ${_id}`, (err, results) => {
				if(err) return next({msg: 'model.builder.builder.gateway.getURLsByResourceId', error: err});
				resolve(results);
			})
		})
	})
}

builder.addMediaDataURLs = (req, res, next, _data) => {
	let query = 'INSERT IGNORE INTO resourcesMedia (mediaType, resources_id, url, mediaImage_url, mediaTitle) VALUES ';
	_data.forEach(item => {
		query += `(${item.mediaType}, ${item.resource_id}, '${item.url}', '${item.imageUrl}', '${item.title}'),`
	});
	query = query.slice(0, -1); // removing the last comma

	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next("Cannot Connect");
			conn.query(query, (err, results) => {
				if(err) return next({msg: 'model.builder.addMediaDataURLs', error: err});
				resolve(results);
			})
		})
	})
}

// ---
builder.getAllResourcesMedia = (req, res, next) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if (err) return next("Cannot Connect");
			conn.query(`SELECT * FROM resourcesMedia LIMIT 300`, (err, results) => {
				if (err) return next({ msg: 'model.builder.builder.gateway.getAllResourcesMedia', error: err });
				resolve(results);
			})
		})
	})
}



module.exports = builder;
