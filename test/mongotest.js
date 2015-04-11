var express = require('express');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/face_score_ranking', function (error) {
    if (error) {
        console.log(error);
    }
});
// model
var User = require("../model/User");

var buf = fs.readFileSync(path.join(__dirname, '11.jpg'), {encoding: 'base64'});

User.update({name: "paper"}, {$set: { image: buf }}, function(err, user) {
    console.log("done");
    if (err) {
        console.log(err);
    } else {
        console.log(user.image);
    }
});
buf = fs.readFileSync(path.join(__dirname, '12.jpg'), {encoding: 'base64'});
User.update({name: "ann"}, {$set: { image: buf }}, function(err, user) {
    console.log("done");
    if (err) {
        console.log(err);
    } else {
        console.log(user.image);
    }
});

//User.update({name: {$in: ['ann', 'paper']}}, {$pull: {friends: 'star'}}, {multi: true}).exec();

