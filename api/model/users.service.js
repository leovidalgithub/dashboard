const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const gateway = require('./users.gateway');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// multer config
const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'files/userimages');
	},
	filename: function (req, file, cb) {
		const uuid = getUuid();
		// const fileExtension = file.originalname.split('.').pop();
		// cb(null , `${user.uuid}.${fileExtension}`);
		cb(null , `${req.user.uuid}.jpg`);
	}
});
exports.upload = multer({ storage: storage })

exports.profileUpdate = (req, res, next) => {
	const {id, user, email} = req.body;
	const image_url = req.file ? `/${req.file.destination}/${req.file.filename}` : null;

	gateway.updateProfile(req, res, next, {id, user, email, image_url})
	.then(async (query) => {
		res.json({statusCode: 200, user:query[0]});
	})
}

exports.verifyAuthentication = (req, res, next) => {
	const AUTH_TOKEN = req.get('authorization'); // req.headers.token;

	jwt.verify(AUTH_TOKEN, process.env.JWT_SECRET, (err, decoded) => {
		if(err) {
			// Invalid Token
			res.statusCode = 401;
			res.json({
				'errorTitle': 'Authentication failed!<br/><br/>',
				'errorMsg': '<strong style="color: red;">Oops!</strong> There was an error with your authentication.<br/>Please, try to log in again.'
			});
		} else {
			req.user = decoded;
			next();
		}
	})
}

exports.getUser = (req, res, next) => {
	const id = req.params.id;
	gateway.getUser(req, res, next, id)
		.then(async (query) => {
			if (query.length == 0) {
				res.json({statusCode: 100});
			} else {
				const token = getToken(query[0].id, query[0].uuid, query[0].user, query[0].email, query[0].image_url);
				res.json({statusCode: 200, token});
			}
		})
}

exports.login = (req, res, next) => {
	const {email, pass} = req.body;
	gateway.login(req, res, next, email)
		.then(async (query) => {
			if (query.length == 0 || !(await bcryptjs.compare(pass, query[0].pass))) {
				res.json({statusCode: 100}); // email or password incorrect
			} else {
				const token = getToken(query[0].id, query[0].uuid, query[0].user, query[0].email, query[0].image_url);
				res.json({statusCode: 200, token});
			}
		})
}

exports.register = async (req, res, next) => {
	const {user, email, pass} = req.body;
	const passHash = await bcryptjs.hash(pass, 8);
	const uuid = getUuid();

	gateway.register(req, res, next, {user, email, passHash, uuid})
		.then(async (query) => {
			if (query.insertId == 0) {
				res.json({statusCode: 102}); // email already exists
			} else {
				req.params.id = query.insertId;
				exports.getUser(req, res, next)
			}
		})
}

const getToken = (id, uuid, user, email, image_url) => {
	const imageVersoningUuid = getUuid();
	image_url = `${image_url}?v=${imageVersoningUuid}`;

	return jwt.sign(
		{id, uuid, user, email, image_url},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRES
		}
	)
}

const getUuid = () => {
	const TMPuuid = uuidv4();
	return TMPuuid.substring(TMPuuid.lastIndexOf('-') + 1);
}