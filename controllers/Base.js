var _ = require("underscore");
module.exports = {
	extend: function(child) {
		return _.extend({}, this, child);
	},
	run: function(req, res, next) {

	}
}