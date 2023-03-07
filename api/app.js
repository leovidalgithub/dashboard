require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const history = require('connect-history-api-fallback');
const mysql = require('mysql');
const myconnection = require('express-myconnection');
const app = express();

app.set('port', process.env.PORT || 8080);

const corsOptions = {
	'origin': '*',
	'methods': ['GET', 'POST'],
	'credentials': true,
	'preflightContinue': true,
	'optionsSuccessStatus': 200
}

// middlewares
app.use(cors(corsOptions));
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(myconnection(mysql, {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE
}, 'single'));

app.use('/api', require('./routes/main.routes'));
app.use('/files', require('./routes/files.routes'));

app.use(history());

app.listen(app.get('port'), () => {
	console.log('dashboard api listening to port ' + app.get('port') );
	// require('./model/scraper.service').testing();
	// require('./model/scraper.service').websiteScraping.foxNewsSearching('recent months', 1);
	// require('./model/builder.service').testing();
	// require('./model/builder.gateway').addMediaDataURLs();
})
