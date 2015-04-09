var redis = require("redis");
var Q = require('q');
/**
 * Application prototype.
 */
var cache = exports = module.exports = {};
var client = redis.createClient();
var pklist = ":pklist";
var scoreset = "score set";
var imageset = "image set";
var randompk = "randompk";

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});


/**
 * get a's pk list
 * a's pk list may be [b, c, d]
 * @returns a promise for the value or error
 */
cache.pklist = function(a) {
	return Q.ninvoke(client, "smembers", a + pklist);
};

/**
 * a pk b, add a to b's pk list
 * after add, b's pk list may be [a, c, d]
 */
cache.addToPKList = function(a, b) {
	//client.hset("matchers map", a, b);
	//client.hset("matchers map", b, a);
	client.sadd(b + pklist, a);
};

/**
 * remove a from b's pk list
 * after remove, b's pk list may be [c, d]
 */
cache.removeFromPKList = function(a, b) {
	client.srem(b + pklist, a);
};

/**
 * set score to user
 */
cache.setScore = function(username, score) {
	client.hset(scoreset, username, score);
};

/**
 * get score of user
 * @returns a promise for the value or error
 */
cache.getScore = function(username) {
	return Q.ninvoke(client, "hget", scoreset, username);
};

/**
 * set image to user
 */
cache.setImage = function(username, image) {
	client.hset(imageset, username, image);
};

/**
 * get image of user
 * @returns a promise for the value or error
 */
cache.getImage = function(username) {
	return Q.ninvoke(client, "hget", imageset, username);
};

cache.addRandom = function(username) {
	client.sadd(randompk, username);
};

/**
 * get random username if exists
 * @returns a promise for the value or error
 */
cache.fetchRandom = function() {
	return Q.ninvoke(client, "spop", randompk);
};