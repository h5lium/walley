var BaseController = require("./Base"),
	View = require("../views/Base"),
	model = new (require("../models/ContentModel")),
	_ = require('underscore');

module.exports = BaseController.extend({ 
	content: null,
	run: function(req, res, next) {
		model.setDB(req.db);
        var menuMarkup = _.reduce(global.config.types, function(memo, type) {
        	if (type.name === 'home') {
        		return memo + '<li><a href="/">'+ type.title +'</a></li>';
        	}
        	return memo + '<li><a href="/'+ (type.plural || type.name) +'">'+ type.title +'</a></li>';
        }, '');
		
		var self = this;
		self.getContent(function(homeData) {
			res.render('home', homeData, function(err, bodyMarkup) {
				var v = new View(res, 'main');
				v.render({
					menu: menuMarkup,
					body: bodyMarkup
				});
			});
		});
	},
	getContent: function(callback) {
		var self = this;
		homeData = {};
		model.getlist(function(err, records) {
			if(records.length > 0) {
				homeData.bannerTitle = records[0].title;
				homeData.bannerText = records[0].text;
			}
			model.getlist(function(err, records) {
				var tweetArticles = '';
				if(records.length > 0) {
					var to = records.length < 5 ? records.length : 4;
					for(var i=0; i<to; i++) {
						var record = records[i];
						tweetArticles += '\
							<div class="item">\
								<a href="/tweet/' + self.safeAttr(record.ID) + '">\
		                            <img src="' + self.safeAttr(record.picture) + '" />\
		                            <span>' + self.safeText(record.title) + '</span>\
	                            </a>\
	                        </div>\
						';
					}
				}
				homeData.tweetArticles = tweetArticles;
				callback(homeData);
			}, { type: 'tweet' });
		}, { type: 'home' });
	}
});