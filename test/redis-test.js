var redis = require("redis"),
    client = redis.createClient();
var Q = require('q');

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

client.set("string key", "string val", redis.print);

fetch().then(function(data) {
	console.log("callback");
	console.log("+++++" + data);
});

client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    if (err) {
        return console.error("error response - " + err);
    }

    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
});

function fetch() {
    //client.sadd("my set", "a");
    // call ninvoke, if client quit, value will not be fetched
    //return Q.ninvoke(client, "spop", "my set");
    return Q.ninvoke(client, "hget", "hash key", "hashtest 1");
		// var deferred = Q.defer();
  //   client.spop("my set", function(err, reply){
  //       deferred.resolve(reply);
  //   });
  //   return deferred.promise;
}

// client.quit(function (err, res) {
//     console.log("Exiting from quit command.");
// });