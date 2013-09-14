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
		var article = '';
		model.getlist(function(err, records) {
			if(records.length > 0) {
				article = '\
					<section>\
	                    <img src="'+ records[0].picture +'" alt="" />\
	                    <h1>'+ self.safeText(records[0].title) +'</h1>\
	                    <p>'+ self.safeText(records[0].text) +'</p>\
	                    <time>' + _.getDateStr(records[0].date) + '</time>\
	                </section>\
                ';
			}
			callback(article);
		}, query, {
			sort: [['date', -1]]
		});
	}
});