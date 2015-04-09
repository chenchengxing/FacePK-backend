var fs = require('fs');
var path = require('path');
var request = require('request');
var querystring = require('querystring');
var Q = require('q');
var config = require('../config/appconfig');

var face = exports = module.exports = {};

face.calBeauty = function(image_base64) {
	var postData = querystring.unescape(
		querystring.stringify({
		  'appid' : config.face_appid,
		  'encoding' : 1,
		  'type' : 'st_facebase',
		  'calctype' : 'st_gender_expression_beauty',
		  'image' : image_base64
		})
  );
  var options = {
	  url: config.face_url,
	  body: postData,
	  headers: {
	    'Content-Type': 'application/json',
	    'Content-Length': postData.length
	  }
	};

	var deferred = Q.defer();
	request.post(options, function(error, response, body) {
		if (!error && response.statusCode == 200) {
	    //console.log(body);
	    var data = JSON.parse(body);
	    if (data.errno != 0) { 
	    	console.log(data);
	  		//deferred.reject(chunk);
	  		deferred.resolve(0.5); 
	  	} else {
	  		if (data.ret[0] === undefined) {
	  			console.log(data);
	  			deferred.resolve(Math.random());
	  			console.log("random beauty");
	  		} else {
	  			deferred.resolve(data.ret[0].beauty);
	  			console.log("true beauty");
	  		}
	  	}
	  } else {
	    console.log('problem with request: ' + error);
	  }
	});

	return deferred.promise;
}



