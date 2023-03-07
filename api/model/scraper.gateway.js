const scraper = {};

scraper.getAllResources = (req, res, next) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next("Cannot Connect");
			conn.query(`
					SELECT rem.resources_id, re.name, rem.qty, rem.mediaType, re.id_langue
						FROM resources re
						JOIN (
							SELECT resources_id, mediaType, count(mediaType) as 'qty' FROM resourcesMedia
							WHERE active = 1
							GROUP BY mediaType, resources_id
						) rem ON rem.resources_id = re.id;`
				, (err, results) => {
				if(err) return next({msg: 'gateway.scraper.getAllResources', error: err});
				resolve(results);
			})
		})
	})
}

scraper.getResourceMedia = (req, res, next, _resource_id, _queryData) => {
	const RANDOM_CLAUSE = _queryData.random_search ? 'ORDER BY RAND ( )' : '';

	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next("Cannot Connect");
			conn.query(`
					SELECT * FROM resourcesMedia
						WHERE resources_id = ${_resource_id}
						AND mediaType = ${_queryData.mediaType}
						AND active = 1
						${RANDOM_CLAUSE}
						LIMIT ${_queryData.limit}
						OFFSET ${_queryData.offset};`
				, (err, results) => {
				if(err) return next({msg: 'gateway.scraper.getResourceMedia', error: err});
				resolve(results);
			})
		})
	})
}

scraper.log = (req, res, next, _data) => {
	req.getConnection((err, conn) => {
		if(err) return next("Cannot Connect");
		conn.query(`
				INSERT INTO log (content_1)
				VALUES ('${_data}')`
			, (err, results) => {
			if(err) return next({msg: 'gateway.scraper.getResourceMedia', error: err});
		})
	})
}

module.exports = scraper;
