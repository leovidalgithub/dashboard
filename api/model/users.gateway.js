
exports.getUser = (req, res, next, id) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next('Cannot Connect');
			conn.query(`
					SELECT * FROM users WHERE id = ?`, [id],
					(err, results) => {
						if(err) return next({msg: 'gateway.users.getUser', error: err});
						resolve(results);
			})
		})
	})
}

exports.login = (req, res, next, email) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next('Cannot Connect');
			conn.query(`
					SELECT * FROM users WHERE email = ?`,
					[email],
					(err, results) => {
						if(err) return next({msg: 'gateway.users.register', error: err});
						resolve(results);
			})
		})
	})
}

exports.register = (req, res, next, user) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next('Cannot Connect');
			conn.query(`
							INSERT INTO users (user,email,pass,uuid)
							SELECT * FROM (SELECT '${user.user}', '${user.email}', '${user.passHash}', '${user.uuid}') AS tmp
							WHERE NOT EXISTS (
								SELECT email FROM users WHERE email = '${user.email}'
							)`,
					(err, results) => {
						if(err) return next({msg: 'gateway.users.register', error: err});
						resolve(results);
			})
		})
	})
}

/*
INSERT INTO users SET ?`,
{user: user.user, email: user.email, pass: user.passHash, uuid: user.uuid},
*/

exports.updateProfile = (req, res, next, user) => {
	return new Promise((resolve, reject) => {
		req.getConnection((err, conn) => {
			if(err) return next('Cannot Connect');
			let setClause;
			if(user.image_url) {
				setClause = `user = '${user.user}', email = '${user.email}', image_url = '${user.image_url}'`;
			} else {
				setClause = `user = '${user.user}', email = '${user.email}'`;
			}
			conn.query(`
					UPDATE users
						SET ${setClause}
						WHERE id = ${user.id}`,
					{user: user.user, pass: user.passHash, uuid: user.uuid},
					(err, results) => {
						if(err) return next({msg: 'gateway.users.updateProfile', error: err});
						resolve(results);
			})
		})
	})
}

// https://blog.bitsrc.io/uploading-files-and-images-with-vue-and-express-2018ca0eecd0