var wrapper = exports = module.exports = {};

wrapper.wrap = function(code, msg, data) {
	var ret = {};
	ret.code = code;
	ret.data = data;
	ret.msg = msg;
	return ret;
}