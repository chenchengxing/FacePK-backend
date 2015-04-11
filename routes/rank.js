var express = require('express');
var router = express.Router();
var wrapper = require('../util/wrapper');

// model
var User = require("../model/User");

/* GET rank listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/all', function(req, res, next) {
  User.find().sort('-score').select('name score image').exec(function(err, users) {
  	res.json(wrapper.wrap(200, "", users));
  })
});

router.get('/friends/:username', function(req, res, next) {
	var username = req.params.username;
	User.findOne({name: username}, 'friends', function(err, user) {
		var friends = user.friends;
		User.where('name').in(friends).sort('-score').select('name score').exec(function(err, users) {
			res.json(wrapper.wrap(200, "", users));
		});
	});
});

module.exports = router;