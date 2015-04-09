var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name:  String,
  token: String,
  score:   Number,
  friends: [String]
});

var User = mongoose.model('user', userSchema);

module.exports = User;