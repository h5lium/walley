var BaseController = require("./Base"),
	View = require("../views/Base"),
	model = new (require("../models/ContentModel")),
	_ = global._;

module.exports = BaseController.extend({ 
	content: null,
	run: function(query, req, res, next) {
		model.setDB(req.db);
		var menuMarkup = _.reduce(global.config.types, function(memo, type) {
			if (type.name === 'home') {
				return memo + '<li><a href="/">'+ type.title +'</a></li>';
			}
			return memo + '<li><a href="/'+ (type.plural || type.name) +'">'+ type.title +'</a></li>';
		}, '');
		
		var self = this;
		self.getContent(query, function(innerMarkup) {
			res.render('inner', {
				inner: innerMarkup
			}, function(err, bodyMarkup) {
				var v = new View(res, 'main');
				v.render({
					menu: menuMarkup,
					body: bodyMarkup
				});
			});
		});
	},
	getContent: function(query, callback) {
		var self = this;
		var blogArticles = '';
		model.getlist(function(err, records) {
			if(records.length > 0) {
				for(var i=0; record=records[i]; i++) {
					var record = records[i];
					blogArticles += '\
						<section class="item">\
							<img src="' + record.picture + '" alt="" />\
							<a href="/'+ record.type +'/'+ record.ID +'">\
								<h2>' + self.safeText(record.title) + '</h2>\
							</a>\
							<p>' + self.safeText(record.text) + '</p>\
							<time>' + _.getDateStr(record.date) + '</time>\
							<br class="clear" />\
							<hr />\
						</section>\
					';
				}
			}
			callback(blogArticles);
		}, query, {
			sort: [['date', -1]]
		});
	}
});