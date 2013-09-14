var BaseController = require("./Base"),
	View = require("../views/Base"),
	model = new (require("../models/ContentModel")),
	crypto = require("crypto"),
	fs = require("fs"),
	path = require('path'),
	_ = global._;

module.exports = BaseController.extend({
	username: global.config.admin.username,
	password: global.config.admin.password,
	contentTypes: global.config.types,
	run: function(req, res, next) {
		var self = this;
		if(this.authorize(req)) {
			model.setDB(req.db);
			req.session.fastdelivery = true;
			req.session.save();
			var v = new View(res, 'admin');
			self.del(req, function() {
				self.form(req, res, function(formMarkup) {
					self.list(function(listMarkup) {
						v.render({
							title: 'Administration',
							content: 'Welcome to the control panel',
							list: listMarkup,
							form: formMarkup
						});
					});
				});
			});
		} else {
			var v = new View(res, 'admin-login');
			v.render({
				title: 'Please login'
			});
		}		
	},
	authorize: function(req) {
		return (
			req.session && 
			req.session.fastdelivery && 
			req.session.fastdelivery === true
		) || (
			req.body && 
			req.body.username === this.username && 
			req.body.password === this.password
		);
	},
	list: function(callback) {
		var self = this;
		model.getlist(function(err, records) {
			var markup = '<table>';
			markup += '\
				<tr>\
					<td><strong>type</strong></td>\
					<td><strong>title</strong></td>\
					<td><strong>picture</strong></td>\
					<td><strong>actions</strong></td>\
				</tr>\
			';
			for(var i=0; record = records[i]; i++) {
				markup += '\
					<tr>\
						<td>' + self.safeText(record.type) + '</td>\
						<td>' + self.safeText(record.title) + '</td>\
						<td><img class="list-picture" src="' + self.safeAttr(record.picture) + '" /></td>\
						<td>\
							<a href="/admin?action=delete&id=' + self.safeAttr(record.ID) + '">delete</a>&nbsp;&nbsp;\
							<a href="/admin?action=edit&id=' + self.safeAttr(record.ID) + '">edit</a>\
						</td>\
					</tr>\
				';
			}
			markup += '</table>';
			callback(markup);
		})
	},
	form: function(req, res, callback) {
		var self = this;
		var typeTags = _.reduce(this.contentTypes, function(memo, type) {
			return memo + '<option value="'+ type.name +'">'+ type.title +'</option>';
		}, '');
		
		var returnTheForm = function() {
			if(req.query && req.query.action === "edit" && req.query.id) {
				model.getlist(function(err, records) {
					if(records.length > 0) {
						var record = records[0];
						res.render('admin-record', {
							ID: self.safeAttr(record.ID),
							text: self.safeAttr(record.text),
							title: self.safeAttr(record.title),
							type: self.safeAttr(record.type),
							typeTags: typeTags,
							picture: self.safeAttr(record.picture),
							pictureTag: record.picture != '' ?
								'<img class="list-picture" src="' + self.safeAttr(record.picture) + '" />' : ''
						}, function(err, html) {
							callback(html);
						});
					} else {
						res.render('admin-record', {
							typeTags: typeTags
						}, function(err, html) {
							callback(html);
						});
					}
				}, {ID: req.query.id});
			} else {
				res.render('admin-record', {
					typeTags: typeTags
				}, function(err, html) {
					callback(html);
				});
			}
		}
		if(req.body && req.body.formsubmitted && req.body.formsubmitted === 'yes') {
			var action = req.body.ID ? 'update' : 'insert';
			var data = {
				title: req.body.title,
				text: req.body.text,
				type: req.body.type,
				picture: this.handleFileUpload(req),
				ID: req.body.ID
			}
			
			if (action === 'insert') {
				data.date = (function(d) {
					var t = 8;
					var n = d.getTimezoneOffset();
					return new Date(d.getTime() + (t - n) * 3600000).toJSON();
				})(new Date());
			}
			model[action](data, function(err, objects) {
				returnTheForm();
			});
		} else {
			returnTheForm();
		}
	},
	del: function(req, callback) {
		if(req.query && req.query.action === "delete" && req.query.id) {
			model.remove(req.query.id, callback);
		} else {
			callback();
		}
	},
	handleFileUpload: function(req) {
		if(! req.files || ! req.files.picture || ! req.files.picture.path) {
			return req.body.currentPicture || '';
		}
		var picture = req.files.picture;
		if (! picture.size) {
			fs.unlink(picture.path, function() {});
			return req.body.currentPicture || '';
		}
		var fileName = picture.name;
		var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
		var uid = crypto.randomBytes(10).toString('hex');
		var tarName = uid + '.' + ext;
		fs.renameSync(picture.path, __dirname +'/../public/uploads/'+ tarName);
		return '/uploads/' + tarName;
	}
});