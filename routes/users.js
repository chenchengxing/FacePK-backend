var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
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
  	} else {
      User.where('name').in(user.friends).select('name image').exec(function(err, users) {
        res.json(wrapper.wrap(200, "", {username: user.name, friends: users}));
      });
    }
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
        res.json(wrapper.wrap(200, "username already exists!"));
        user.token = token;
        user.save();
      }
    } else {
      var defaultFriend =  "paper";
      var newUser = new User({name: username, token: token, score: 0, friends: [defaultFriend], image: image_mock()});
      newUser.save(function (err) {
        if (err)
        console.log(err);
      });
      User.update({name: defaultFriend}, {$push: { friends: username }}).exec();
      res.json(wrapper.wrap(200, "", {id: newUser._id, name: newUser.name}));
    }
  });
});

// add friend to each other
router.post('/addFriend', function(req, res, next) {
  var me = req.body.me;
  var friend = req.body.friend;
  User.update({name: me}, {$push: { friends: friend }}).exec();
  User.update({name: friend}, {$push: { friends: me }}).exec();
  res.json(wrapper.wrap(200, "success"));
});

// reset user
router.post('/reset', function(req, res, next) {
  var username = req.body.username;
  User.findOneAndRemove({name: username}, function(err, user) {
    if (err) {
      console.log(err);
      res.json(wrapper.wrap(201, "reset error"));
    } else {
      User.update({name: {$in: user.friends}}, {$pull: {friends: username}}, {multi: true}).exec();
      res.json(wrapper.wrap(200, "success"));
    }
  });
});

function image_mock() {
  var r = 1;
  r = Math.floor(Math.random() * 10) % 5 + 10;
  return fs.readFileSync(path.join(__dirname, '../test/' + r + '.jpg'), {encoding: 'base64'});
}

module.exports = router;
