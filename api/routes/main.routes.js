const router = require('express').Router();
const users_service = require('../model/users.service');
const scraper_service = require('../model/scraper.service');
const builder_service = require('../model/builder.service');

// router.get('/', scraper_service.test);
// router.get('/db', scraper_service.getDB);
// router.get('/scraper/scrapeAll', scraper_service.getResources);
router.get('/builder/getMediaInfoByResourceId/:id', builder_service.getMediaInfoByResourceId);
router.get('/builder/getAllResourcesMedia', [users_service.verifyAuthentication], builder_service.getAllResourcesMedia);

// users - login & register
router.get('/users/getUser/:id', [users_service.verifyAuthentication], users_service.getUser);
router.post('/users/login', users_service.login);
router.post('/users/register', users_service.register);
router.post('/users/profileUpdate', [users_service.verifyAuthentication, users_service.upload.single('profileImage')], users_service.profileUpdate);

// scraper
router.get('/scraper/getAllResources', [users_service.verifyAuthentication], scraper_service.getAllResources);
router.post('/scraper/searchByResourcesId', [users_service.verifyAuthentication], scraper_service.searchByResourcesId);

// testing
router.get('/scraper/test', scraper_service.testing);

// error handler
router.use((error, req, res, next) => {
	console.log("Error -main- middleware!")
	console.log('req.path: ', req.path)
	console.log('error.msg', error.msg)
	console.log('error.error', error.error)
	// *** LOG DATABASE ***
	res.status(500).json(error)
})

module.exports = router;
