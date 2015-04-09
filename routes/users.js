var express = require('express');
var router = express.Router();
var wrapper = require('../util/wrapper');

// model
var User = require("../model/User");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// user list
router.get('/list', function(req, res) {
  User.find(function(err, users) {
    res.json(wrapper.wrap(200, "", users));
  })
});

// view user's friends
router.get('/:username', function(req, res) {
  var username = req.params.username;
  User.findOne({name: username}, 'name friends', function(err, user) {
  	if (user == null) { 
  	  res.json(wrapper.wrap(201, "user not exists!"));
  	  return;
  	};
    res.json(wrapper.wrap(200, "", {username: user.name, friends: user.friends}));
  })
});

// add a user, username and token are required
router.post('/addUser', function(req, res, next) {
  var username = req.body.username;
  var token = req.body.token;
  if (username == undefined) {
    res.json(wrapper.wrap(201, "username required!"));
    return;
  };
  if (token == undefined) {
    res.json(wrapper.wrap(201, "token required!"));
    return;
  }

  User.findOne({name: username}, function(err, user) {
    if (user) {
      if (user.token === token) {
        res.json(wrapper.wrap(200));
      } else {
        res.json(wrapper.wrap(201, "username already exists!")); 
      }
    } else {
      var newUser = new User({name: username, token: token, score: 0, friends: ["paper"]});
      newUser.save(function (err) {
        if (err)
        console.log(err);
      });

      res.json(wrapper.wrap(200, "", {id: newUser._id, name: newUser.name}));
    }
  });
});

module.exports = router;
