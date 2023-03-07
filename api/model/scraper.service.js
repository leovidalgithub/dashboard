const gateway = require('./scraper.gateway');
const gatewayBuilder = require('./builder.gateway');
const cheerio = require('cheerio');
const axios = require('axios');
const scraper = {};

scraper.getAllResources = (req, res, next) => {
	gateway.getAllResources(req, res, next)
		.then(query => {
			let data = [];
			query.forEach(reso => {
				if(!data.some(item => item.id == reso.resources_id)) {
					data.push(getResourceModel(reso.resources_id, reso.id_langue))
				}
				let index = data.map(item => item.id).indexOf(reso.resources_id);
				data[index].name = reso.name;
				data[index]['media_types'][reso.mediaType].quantity = reso.qty;
				// if(reso.qty > 0) data[index][reso.mediaType].disabled = false;
			})

			setTimeout(() => {
				res.json({statusCode: 200, data});
			},Math.floor(Math.random() * (1750 - 750)));
		})
}
scraper.searchByResourcesId = (req, res, next) => {
		const { queryData, info, resource_id, requestIndex } = req.body;
		gatewayBuilder.getResourceInfoById(req, res, next, resource_id)
			.then(query => {
				const scraper_function = query[0].scraper_function + '_scraping' || 'generic_scraping';
				const scraper_selectors = query[0].scraper_selectors || '';
				const required_cookies = query[0].required_cookies || '';
				console.log(`Scraper ${query[0].name} - ${scraper_function}`);

					scraperFunctions[scraper_function](req, res, next, info, resource_id, scraper_selectors, required_cookies, queryData, function(_resultsArray) {
						res.json({
								resource_id: resource_id,
								articles: _resultsArray,
								info: info,
								requestIndex: requestIndex
							})
					})
				})
}

const scraperFunctions = {
	generic_scraping: async function(req, res, next, _info, _resource_id, _scraper_selectors, _required_cookies, _queryData, _callback) {
		try {
			const SELECTORS = _scraper_selectors.split(',');
			const PARAGRAPH_SIZE = _info.paragraph_size;
			let mediaDataArray = [];
			const Q = await gateway.getResourceMedia(req, res, next, _resource_id, _queryData);

			await Promise.all(Q.map(async function(item) {
				const RESPONSE = axios.get(item.url,
					{
						headers: {
							'Cookie': _required_cookies
						}
					});
				const BODY = await RESPONSE;

				let $ = cheerio.load(BODY.data,);
				let article;

				SELECTORS.some(selector => {
					article = $(selector).text();
					if(article.length > 0)
						return true;
				})

				let charactersCount = article.length;
				let paragraphsArray = getParagraphArray(article, PARAGRAPH_SIZE);

	// TODO: check because sometimes each paragraph comes in <p></p>
	// and sometimes comes in only one <p> separated by <br><br>

				mediaDataArray.push({
					paragraphsArray: paragraphsArray,
					charactersCount: charactersCount,
					url: item.url,
					mediaType: item.mediaType,
					mediaImage_url: item.mediaImage_url,
					mediaTitle: item.mediaTitle
				})
			}))
			scraperFunctions.searchAndExtract(req, res, next, _info, mediaDataArray, _callback);
		} catch (err) {
			next({msg: '`service.FoxNewsfn_scraping', error: err});
		}
	},
	searchAndExtract(req, res, next, _info, _mediaDataArray, _callback) {
		const CONTEXT = _info.context;
		const SEARCHTEXT = _info.searchText.toLocaleLowerCase();
		let resultsArray = [];


		_mediaDataArray.forEach(article => {
			let matchesArray = [];
			let indexesAdded = [];
			let matchesFound = 0;
			article.paragraphsArray.forEach((paragraph, index) => {
				let searchIndex = paragraph.toLocaleLowerCase().indexOf(SEARCHTEXT);
				if (searchIndex >= 0) {
					matchesFound++;
					let matchText = paragraph.substring(searchIndex, searchIndex + SEARCHTEXT.length);
					// article.paragraphsArray[index] = cheerio.load(article.paragraphsArray[index])('html').text(); // removing all html tags
					article.paragraphsArray[index] = article.paragraphsArray[index].replace(matchText, `<span>${matchText}</span>`);
					for (let i = index - CONTEXT; i <= index + CONTEXT; i++) {
						if (typeof article.paragraphsArray[i] !== 'undefined' && indexesAdded.indexOf(i) === -1) {
							matchesArray.push(article.paragraphsArray[i]);
							indexesAdded.push(i);
						}
					}
				}
			})
			resultsArray.push({
				matchesFound: matchesFound,
				matchesArray: matchesArray,
				searchText: SEARCHTEXT,
				url: article.url,
				charactersCount: article.charactersCount,
				mediaType: article.mediaType,
				mediaImage_url: article.mediaImage_url,
				mediaTitle: article.mediaTitle,
				action: false
			})
		})
		_callback(resultsArray)
	}
}

const getResourceModel = function(_id, _id_langue) {
	return 	{
		id: _id,
		name: '',
		id_langue: _id_langue,
		media_types: {
			'1': {
				quantity: 0,
				name: 'text'
			},
			'2': {
				quantity: 0,
				name: 'transcript'
			},
			'3': {
				quantity: 0,
				name: 'video'
			}
		}
	}
}
const getParagraphArray = function(_text, _paragraph_size) {
	if(_text.length <=500)
		return [_text]

	let array = [];

	while (_text.length > 0) {
		let taken;
		if (_text.length > _paragraph_size) {
			let extract = _text.substr(0, _paragraph_size);
			let lastIndex = extract.lastIndexOf('.');
			if (lastIndex === -1)
				lastIndex = extract.lastIndexOf(' ');
			if (lastIndex === -1)
				lastIndex = 0;

			taken = _text.substring(0, lastIndex + 1);
		} else {
			taken = _text;
		}

		array.push(taken);
		_text = _text.replace(taken, '');
	}

	return array;
}

// --------------------------------- P L A Y G R O U N D ---------------------------------

async function getHTMLBody(urlArray) {
	const fetchUrl = (urlArray) => axios.get(urlArray);
	const promises = urlArray.map(fetchUrl);
	const responses = await Promise.all(promises);
	const bodyArray = responses.map(res => {
		return {body: res.data, url:urlArray}
	})
	return bodyArray;
}

// SCRAPING FUNCTIONS
scraper.testing = async (req, res, next) => {
	console.log("I'm scraping ......");
return;
	axios.get('https://www.cnn.com/2021/08/22/asia/kabul-airport-chaos-evacuations-intl/index.html')
		.then(function (response) {
			let body = response.data;
			let $ = cheerio.load(body);
			console.log($('title').text());
			let results = [];

			$('.zn-body__paragraph').each(function () {
				// results.push($(this).text());
				console.log($(this).text());
				console.log('*************************************');
			});
			// res.json({data:results});
		})

	// let urls = [
	// 	'https://www.foxnews.com/category/shows/special-report/transcript'
	// ];
	// const bodyArray = await getHTMLBody(['https://www.foxnews.com/category/shows/special-report/transcript']);
	// bodyArray.forEach(body => {
	// 	let $ = cheerio.load(body);
	// 	console.log($('title').text());
	// })


	// axios.get('https://www.foxnews.com/category/shows/special-report/transcript')
	// 	.then(function (res) {
	// 		let body = res.data;
	// 		let $ = cheerio.load(body);
	// 		let title = [... $('.content.article-list').find('article.article')];
	// 		// let links;
	// 		title.forEach(item => {
	// 			let link = $(item).find('.m a') .attr("href")
	// 			if (!link.includes('http')) {
	// 				link = 'https://www.foxnews.com/' + link;
	// 				getTitle(link);
	// 			}
	// 		})
	// 		// var link = 'https://www.foxnews.com/' + $(item).find('.m a') .attr("href");
	// 			// console.log(link);
	// 			// getTitle(link)

	// 		// let link = 'https://www.foxnews.com/' + $(title[0]).find('.m a') .attr("href");
	// 		// console.log(link);
	// 		// getTitle(link);
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});
}

const getTitle = function(url) {
	axios.get(url)
		.then(function (res) {
			let body = res.data;
			let $ = cheerio.load(body);
			console.log($('title').text());
		})
}

/*
let obj = [... document.querySelectorAll('.collection-article-list.has-load-more .content.article-list article.article > .m > a')]
let links = obj.map(item => item.getAttribute('href'))
links.forEach((link, i) => console.log((i + 1) + ' - ' + link))
copy(links)

API
https://www.foxnews.com/api/article-search?searchBy=tags&values=fox-news%2Fshows%2Fspecial-report%2Ftranscript&excludeBy=tags&excludeValues=&size=29&from=1
*/


/* working well
	var s = 'Absolutely. And';
	var myRe = /[^\n]+(?<=(Absolutely. And))([^\n]+){1}/gm;
	var str = pepe;
	var myArray;
	while ((myArray = myRe.exec(str)) !== null) {
		var msg = 'Se ha encontrado ' + myArray[0] + '. ';
		msg += 'La siguiente coincidencia empieza en el indice ' + myRe.lastIndex;
		console.log(msg);
	}

	working well too with variable
		var stringToGoIntoTheRegex = "Absolutely. And";
		var regex = new RegExp("[^\n]+(?<=(" + stringToGoIntoTheRegex + "))([^\n]+){1}", "gm");
		var myArray;
		while ((myArray = regex.exec(pepe)) !== null) {
			var msg = 'Se ha encontrado ' + myArray[0] + '. ';
			msg += 'La siguiente coincidencia empieza en el indice ' + regex.lastIndex;
			console.log(msg);
		}
*/

/* regex for find substring and extracting in between two newlines
			var regex = new RegExp("[^\n]+(?<=(" + searchText + "))([^\n]+){1}", "g"); // gm
			var myArray;
			var paragraphs = [];
			while ((myArray = regex.exec(article)) !== null) {
				paragraphs.push(myArray[0]);
				var msg = 'Se ha encontrado ' + myArray[0] + '. ';
				msg += 'La siguiente coincidencia empieza en el indice ' + regex.lastIndex;
				console.log(msg);
			}
*/

/* cheerion using an Array of URLs
	// 	const dataArray = await getHTMLBody(URLsArray);
	// 	dataArray.forEach(data => {
	// 		let $ = cheerio.load(data.body);
	// 		let article = $('#wrapper > div.page-content > div.row.full > main > article > div > div.article-content > div > p:nth-child(5)');
	// 		article = article.text();
	// 		let count = article.length;
*/

module.exports = scraper;

// let q = 7;
// let c = 0;
// do {
// 	if (q%2 == 0)
// 		q = q / 2;
// 	else
// 		q = (q * 3) + 1;
// 		c++;
// 	console.log(q);
// } while (q !== 1);
// console.log('c', c);


/*
	let text= `
	Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut mollitia, eum maxime, earum a dolore ullam rerum alias exercitationem illo nihil! Sit laudantium nemo cumque, molestiae sunt inventore eaque doloremque nulla perspiciatis amet voluptates maxime sed consequuntur aliquam vel sapiente tenetur deleniti eligendi eius modi qui? Explicabo at pariatur est molestias nostrum voluptatibus natus dolorem eveniet quo quibusdam inventore suscipit quos, magnam perferendis quas iste dicta eligendi laudantium distinctio omnis doloribus exercitationem ipsam unde laborum. Minima expedita suscipit inventore veritatis quam delectus temporibus dolorum nostrum quibusdam, animi, aliquid a impedit corrupti consequuntur esse error sequi maxime? Cumque esse et molestias, ducimus sed modi dolor libero corrupti deserunt molestiae, id praesentium ex quas illum, cum itaque iste. Laboriosam accusamus magnam repellendus sunt maiores porro doloremque odio aliquid, vitae perspiciatis asperiores ab autem numquam sed accusantium dolorum at itaque. Repudiandae, dignissimos sapiente illum totam nesciunt magnam, debitis ex nostrum optio ducimus alias! Aliquid minus impedit fugit ad ut voluptatibus itaque corrupti eum facilis, sed temporibus laborum, adipisci maiores cumque, repellat consectetur quas earum nesciunt provident officia magni. Voluptate impedit illo dolorem consequatur, doloribus error repudiandae rem! A est atque explicabo libero dolores facere corrupti iste blanditiis qui sequi fugit, eveniet ut. Aliquam, itaque qui earum cumque accusamus quos aperiam, necessitatibus quibusdam asperiores, quia ipsam dignissimos iure inventore libero rem est illum distinctio cum! Modi qui, dolor error facere fugiat quae quidem praesentium illum, sit exercitationem fuga consequuntur quam sunt officia corrupti, est dolores dicta illo. Illum beatae sequi asperiores culpa nemo unde omnis, doloremque perferendis obcaecati? Eligendi distinctio beatae omnis quidem soluta temporibus, aperiam explicabo sapiente doloremque magni? Voluptatum, alias voluptatibus dignissimos libero qui earum illum doloremque assumenda architecto corrupti at velit quo vel, nesciunt deleniti facilis ullam sit dolor beatae, iste animi! Dignissimos inventore voluptates, deserunt cupiditate consectetur consequatur necessitatibus aut amet nulla quo in voluptatem enim odio modi? Tenetur, facilis dolores voluptatum omnis quod excepturi nulla unde maiores! Blanditiis modi similique voluptas unde provident mollitia, aliquam consectetur molestias dolore cupiditate nostrum quod delectus magni sed deleniti maxime, doloribus temporibus! Officia cum pariatur soluta quo neque tempore beatae eveniet doloremque culpa cupiditate fuga nemo rerum, magni necessitatibus? Quae consectetur beatae vitae incidunt accusantium delectus! Praesentium, quaerat est! Ipsam, fugiat? Doloremque sunt delectus necessitatibus earum dicta, fuga nam eveniet repellendus maiores reprehenderit laboriosam, similique perspiciatis provident magni molestias est libero suscipit nostrum fugiat iure. Obcaecati nobis nihil nulla ut fugit cum excepturi ex labore tenetur beatae animi corporis eius reiciendis temporibus praesentium doloremque deserunt minima nisi veritatis, totam vitae doloribus sit. Esse et aut quidem repellat corporis neque. Non facere neque excepturi, modi, iusto cum dolorem laudantium natus, numquam voluptatibus mollitia? Adipisci quibusdam saepe ex atque, voluptatem ullam quisquam possimus quae aliquid similique. Aspernatur autem eum ab ducimus quas suscipit cupiditate possimus qui, maxime, perspiciatis error deserunt, adipisci molestiae! Architecto est aspernatur quos optio, ratione corporis in, repudiandae dolorem explicabo amet velit. Commodi exercitationem, nam, repellat numquam facilis mollitia odit, a tempora voluptates praesentium aperiam? Eligendi quidem rerum enim inventore, quasi odio?`;
*/