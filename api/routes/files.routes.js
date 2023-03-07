const router = require('express').Router();

// router.use(function (req, res, next) {
// 	next();
// })

///builder/getMediaInfoByResourceId/:id
//http://localhost:8080/api/builder/getMediaInfoByResourceId/3
//const resource_id = req.params.id;

router.get('/userimages/:name', function(req, res, next) {
	res.sendFile(`${process.cwd()}/files${req.path}`)
});

// files/userimages/d195532fec1c.jpg

// error handler
router.use((error, req, res, next) => {
	console.log("Error -files- middleware!")
	console.log('req.path: ', req.path)
	console.log('error.msg', error.msg)
	console.log('error.error', error.error)
	// *** LOG DATABASE ***
	res.status(500).json(error)
})

module.exports = router;
