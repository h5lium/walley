var _ = require("underscore");
module.exports = {
	extend: function(child) {
		return _.extend({}, this, child);
	},
	run: function(req, res, next) {

	},
	safeText: function(str) {
		return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	},
	safeAttr: function(str) {
		return str.replace(/"/g, '\"').replace(/'/g, '\'');
	}
}