const mysql = require('mysql');

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE
})

connection.connect( (error) => {
	if(error) {
		console.log('Connection error: ', error);
		return;
	}
	console.log('DB connection success!');
})

module.exports = connection

/*
	'INSERT INTO log SET ?', {date:'2021-09-04 16:50:27', content_1:'content_1', content_2:'content_2'}, (error, results) => {}
	'SELECT * FROM users WHERE user = ?', [user], (error, results) => {}
*/
