const gateway = require('./builder.gateway');
const cheerio = require('cheerio');
const axios = require('axios');
const xml2js = require('xml2js');
const builder = {};
//http://localhost:8080/api/builder/getMediaInfoByResourceId/3

builder.getMediaInfoByResourceId = (req, res, next) => {
	const resource_id = req.params.id;
	gateway.getResourceInfoById(req, res, next, resource_id)
		.then(query => {
			const builder_function = query[0].builder_function + '_builder';
			console.log(`Builder ${query[0].name} - ${builder_function}`);
			builderFunctions[builder_function](req, res, next, resource_id, builder_function);
		})
}

const builderFunctions = {
	FoxNews_builder: async function(req, res, next, _resource_id, builder_function) {
		const size = 20; // 20;
		let from = 0; // 0
		let mediaDataToAdd = [];
		let exit = false;

		do {
			try {
				const sourceURLs = await axios.get(`https://www.foxnews.com/api/article-search?searchBy=tags&values=fox-news%2Fshows%2Fspecial-report%2Ftranscript&excludeBy=tags&excludeValues=&size=${size}&from=${from}`);

				sourceURLs.data.forEach(item => {
					// if (item.category.name === 'TRANSCRIPT') { // also adding SPECIAL REPORT
						if (!mediaDataToAdd.some(newItem => newItem.url.includes(item.url))) {
							mediaDataToAdd.push({
								url: 'https://www.foxnews.com' + item.url.replaceAll("'", "&apos;"), // simple quote escape
								imageUrl: item.imageUrl.replaceAll("'", "&apos;"),
								title: item.title.replaceAll("'", "&apos;"),
								mediaType: 3, // video
								resource_id: _resource_id
							})
						}
					// }
				})
				exit = sourceURLs.data.length <= 0;
				from += size;
			} catch (err) {
				next({msg: `service.builderFunctions.${builder_function}`, error: err});
				exit = true;
			}
		} while (!exit);

		// sending the new data to database
		builderFunctions.addMediaDataURLs(req, res, next, mediaDataToAdd);
	},
	CNN_RSS_builder: async function(req, res, next, _resource_id, builder_function) {
		const dbURLs = await gateway.getURLsByResourceId(req, res, next, _resource_id);

		axios.get('http://rss.cnn.com/rss/cnn_topstories.rss')
			.then(function(response) {
				let xml = response.data;
				let mediaDataToAdd = [];

				// XML to JSON parse
				xml2js.parseString(xml, (err, result) => {
					if(err) {
						next({msg: `service.builder_functions.${builder_function} error while parsing XML to JSON`, error: err});
					}
					// const json = JSON.stringify(result, null, 4);

					let data = result.rss.channel[0].item;
					data.forEach(element => {
						let url = element['feedburner:origLink'][0];
						if (!dbURLs.some(dbItem => dbItem.url.includes(url))) {
							if(url.endsWith('/index.html')) {
								let imageUrl = typeof element['media:group'] !== 'undefined' ? element['media:group'][0]['media:content'][0]['$']['url'] : '';
								mediaDataToAdd.push({
									url: url.replaceAll("'", "&apos;"), // simple quote escape
									imageUrl: imageUrl.replaceAll("'", "&apos;"),
									title: element.title[0].replaceAll("'", "&apos;"),
									mediaType: 3, // video
									resource_id: _resource_id
								})
							}
						}
					})
				})
				builderFunctions.addMediaDataURLs(req, res, next, mediaDataToAdd);
			})
			.catch(err => {
				next({msg: `service.builder_functions.${builder_function} error while axios request`, error: err});
			})
	},
	NPR_builder: async function(req, res, next, _resource_id, builder_function) {
		const limit = 500;
		const newsTypeMapping = [
			{ type_id: 1001, resource_id : 3, name: 'news' },
			{ type_id: 1004, resource_id : 4, name: 'world' },
			{ type_id: 1014, resource_id : 5, name: 'politics' },
			{ type_id: 1128, resource_id : 6, name: 'health' },
			{ type_id: 1007, resource_id : 7, name: 'science' },
			{ type_id: 1106, resource_id : 8, name: 'music-news' }
		];

		try {
			newsTypeMapping.forEach(async function(item) {
				let start = 1;
				let articlesAvailable = true;
				let mediaDataToAdd = [];
				do {
					const sourceURLs = await axios.get(`https://www.npr.org/get/${item.type_id}/render/partial/next?start=${start}`);

					let $ = cheerio.load(sourceURLs.data,);
					let articles = [... $('article.item.has-image')];
					articlesAvailable = articles.length > 0;

					articles.forEach(article => {
						let url = $(article).first().find('a').attr('href');
						let imageUrl = $(article).first().find('a picture img').attr('src');
						let title = $(article).first().find('h2.title a').text();
						let transcript = $(article).first().find('li.audio-tool-transcript a').attr('href');

						mediaDataToAdd.push({
							url: url.replaceAll("'", "&apos;"), // simple quote escape
							imageUrl: imageUrl.replaceAll("'", "&apos;"),
							title: title.replaceAll("'", "&apos;"),
							mediaType: 1, // text
							resource_id: item.resource_id
						})

						if (typeof transcript !=='undefined') {
							mediaDataToAdd.push({
								url: transcript.replaceAll("'", "&apos;"), // simple quote escape
								imageUrl: imageUrl.replaceAll("'", "&apos;"),
								title: title.replaceAll("'", "&apos;"),
								mediaType: 2, // transcript
								resource_id: item.resource_id
							})
						}
					})
					start +=24;
				} while (start < limit && articlesAvailable);
				builderFunctions.addMediaDataURLs(req, res, next, mediaDataToAdd);
			})
		} catch (error) {
			next({msg: `service.builderFunctions.${builder_function}`, error: err});
		}
	},
	// sending data media URLs to database - (URL, imageURL and title)
	addMediaDataURLs: function(req, res, next, _mediaDataToAdd) {
		if (_mediaDataToAdd.length) {
			gateway.addMediaDataURLs(req, res, next, _mediaDataToAdd)
				.then(data => {
					res.json(data);
				})
				.catch(err => {
					next({msg: `service.builderFunctions.addMediaDataURLs`, error: err});
				})
		} else {
			res.json({affectedRows: 0});
		}
	}
}

module.exports = builder;

// builder.testing = () => {
// 	console.log('builder.testing');
// 	builderFunctions.NPR_builder();
// }

builder.getAllResourcesMedia = (req, res, next) => {
	const resource_id = req.params.id;
	gateway.getAllResourcesMedia(req, res, next, resource_id)
		.then(data => {
			res.json(data);
		})
}

