var fs = require('fs');
var path = require('path');
var http = require('http');
var querystring = require('querystring')
var config = require('../config/appconfig')
var request = require('request');

var buf = fs.readFileSync(path.join(__dirname, '2.jpg'), {encoding: 'base64'});

var postData = querystring.unescape(
	querystring.stringify({
	  'appid' : '10000',
	  'encoding' : 1,
	  'type' : 'st_facebase',
	  'calctype' : 'st_gender_expression_beauty',
	  'image' : buf
	})
);

// console.log(postData);
var options = {
  //hostname: '10.46.109.53',
  // hostname: config.face_host,
  // port: 8181,
  // path: '/vis-api.fcgi',
  url: "http://10.46.109.53:8181/vis-api.fcgi",
  //method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  },
  body: postData
};

request.post(options, function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body);
    var info = JSON.parse(body);
    console.log(info.ret[0].beauty);
  } else {
    console.log('problem with request: ' + error);
  }
});

// var req = http.request(options, function(res) {
//   console.log('STATUS: ' + res.statusCode);
//   console.log('HEADERS: ' + JSON.stringify(res.headers));
//   res.setEncoding('utf8');
//   res.on('data', function (chunk) {
//     console.log(chunk);
//     //var data = JSON.parse(chunk.replace(/\r?\n|\r/g,""));
//     //console.log(data);

//     //console.log(data.ret[0].beauty);
//     //console.log(JSON.parse(chunk).ret[0].beauty);
//   });
// });

// req.on('error', function(e) {
//   console.log('problem with request: ' + e.message);
// });

// // write data to request body
// req.write(postData);
// req.end();