var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
require('q');
var apn = require('../util/apn');
var face = require('../util/face');
var cache = require('../util/cache');
var wrapper = require('../util/wrapper');

// model
var User = require("../model/User");

var loseMsg = "You are less beautiful! Drop points: 5";
var winMsg = "You are more beautiful! Bonus points: 5";
var drawMsg = "You are almost the same beautiful!";

/* random pk request */
router.post('/random', function(req, res, next) {
  var username = req.body.username;
  var buf = req.body.image;
  User.findOne({name: username}, function(err, curUser) {
  	if (!curUser) {
  		res.json(wrapper.wrap(201, "user not exists!"));

  	} else {
			buf = (buf === undefined ? buf_mock() : buf);
			random(username, buf, res);
  	}
  });
});

function random(username, buf, res) {
	var iWin = true;
	var isDraw = false;
	face.calBeauty(buf).then(function(beauty) {
		cache.fetchRandom().then(function(data) {
			cache.setImage(username, buf);
			if (data == null) {
				cache.addRandom(username);
				cache.setScore(username, beauty);
				// res.json({code: 200, status: 'wait'});
				res.json(wrapper.wrap(200, "Please wait for other random players", {status: 'wait'}));
			} else {
				cache.getScore(data).then(function(score) {
					console.log(username + " vs " + data + " - " + beauty + " vs " + score);
					if (score == null) { score = 0.5; };
					if (score > beauty) {
						iWin = false;
						updateScore(data, username);
					} else if (score < beauty) {
						updateScore(username, data);
					} else {
						isDraw = true;
					}
					var msg = isDraw ? drawMsg : (iWin ? winMsg : loseMsg);
					var result = isDraw ? 'draw' : (iWin ? 'win' : 'lose');
					// res.json({code: 200, result: result, msg: msg});
					cache.getImage(data).then(function(image) {
						res.json(wrapper.wrap(200, msg, {result: result, image: image, pk_from: data}));
					});
					User.findOne({name: data}, 'token', function(err, user) {
						if (user) {
				  		var note = apn.notification();
				  		note.badge = 1;
				  		var msg = isDraw ? drawMsg : (iWin ? loseMsg : winMsg)
				  		note.setAlertText("pk[" + username + "] result: " + msg);
				  		note.payload.push_type = 'res';
			  			note.payload.pk_result = isDraw ? 'draw' : (iWin ? 'lose' : 'win');
			  			note.payload.pk_from = username;
				  		apn.pushNotification(note, user.token);
				  	} else {
				  	  console.error("user not exists!");
				  	}
					});
				});
			}
		});
	}, function(error) {
		console.error(error);
		res.send(error);
	});
}

/**
 * target pk request
 */
router.post('/target', function(req, res, next) {
	var from = req.body.from;
	var to = req.body.to;
	var buf = req.body.image;

	User.where("name").in([from, to]).exec(function(err, users) {
		if (users.length < 2) {
			res.json(wrapper.wrap(201, "user not exist"));
		} else {
			buf = (buf === undefined ? buf_mock() : buf);
			face.calBeauty(buf).then(function(beauty) {
				// record score of pk starter
				cache.setScore(from, beauty);
				cache.setImage(from, buf);
				cache.addToPKList(from, to);
				var msg = "Please wait for [" + to + "] to accept pk~";
				res.json(wrapper.wrap(200, msg, {status: 'wait'}));
				users.forEach(function(user, i) {
					if (to === user.name) {
						// send pk request
						var note = apn.notification();
				  		note.badge = 1;
				  		note.setAlertText("[" + from + "] is waiting to pk with you!");
				  		note.payload.push_type = 'pk';
				  		note.payload.pk_from = from;
				  		apn.pushNotification(note, user.token);
					}
				});
			});
		}
	});
});

/**
 * get user's challengers
 */
router.get('/challengers/:username', function(req, res, next) {
	var username = req.params.username;
	cache.pklist(username).then(function(pklist) {
		res.json(wrapper.wrap(200, "", {names: pklist}));
	});
});

router.post('/accept', function(req, res, next) {
	var me = req.body.me;
	var username = req.body.username;
	var buf = req.body.image;
	User.where("name").in([me, username]).exec(function(err, users) {
		if (users.length < 2) {
			res.json(wrapper.wrap(201, "user not exist"));
		} else {
			buf = (buf === undefined ? buf_mock() : buf);
			face.calBeauty(buf).then(function(beauty) {
				var iWin = true;
				var isDraw = false;
				cache.setImage(me, buf);
				// get score of challenger
				cache.getScore(username).then(function(score) {
					cache.removeFromPKList(username, me);
					console.log(me + " vs " + username + " - " + beauty + " vs " + score);
					if (score == null) { score = 0.5; };
					if (score > beauty) {
						iWin = false;
						updateScore(username, me);
					} else if (score < beauty) {
						updateScore(me, username);
					} else {
						isDraw = true;
					}
					var msg = isDraw ? drawMsg : (iWin ? winMsg : loseMsg);
					var result = isDraw ? 'draw' : (iWin ? 'win' : 'lose');
					res.json(wrapper.wrap(200, msg, {result: result}));
					users.forEach(function(user, i) {
						if (username === user.name) {
							console.log("push to user: " + username);
							var msg = isDraw ? drawMsg : (iWin ? loseMsg : winMsg)
							// send pk request
							var note = apn.notification();
					  		note.badge = 1;
					  		note.setAlertText("pk[" + me + "] result: " + msg);
					  		note.payload.push_type = 'res';
					  		note.payload.pk_result = isDraw ? 'draw' : (iWin ? 'lose' : 'win');
					  		note.payload.pk_from = me;
					  		apn.pushNotification(note, user.token);
						}
					});
				});
			});
		}
	});
});

router.get('/image/:username', function(req, res, next) {
	var username = req.params.username;
	cache.getImage(username).then(function(image) {
		res.json(wrapper.wrap(200, "", {username: username, image: image}));
	});
});

function updateScore(winer, loser) {
	User.update({name: winer}, {$inc: { score: 5 }}).exec();
	User.update({name: loser}, { $inc: { score: -5 }}).exec();
}

function buf_mock() {
	var r = 1;
	r = Math.floor(Math.random() * 10) % 6 + 1;
	console.log("mock" + r);
	return fs.readFileSync(path.join(__dirname, '../test/' + r + '.jpg'), {encoding: 'base64'});
}
module.exports = router;