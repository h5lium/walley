
var http = require('http'),
	express = require('express'),
	app = express(),
	_ = global._ = require('./lib/mylib')(require('underscore')),
	config = global.config = require('./config')('local'),
	dbinit = require('./lib/dbinit');
var Admin = require('./controllers/Admin'),
	Home = require('./controllers/Home'),
	List = require('./controllers/List'),
	Page = require('./controllers/Page');


app.set('view engine', 'hjs');
app.set('views', __dirname + '/templates');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.bodyParser({ uploadDir: config.tmpDir }));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: config.secret }));
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));


dbinit(config.mongo, function(err, db) {
	if (err) {
		db && db.close();
		console.error('Sorry, there is a problem with mongo db server.');
		return;
	}
	var attachDB = function(req, res, next) {
		req.db = db;
		next();
	};
	app.all('/', attachDB, function(req, res, next) {
		Home.run(req, res, next);
	});	
	app.all('/admin', attachDB, function(req, res, next) {
		Admin.run(req, res, next);
	});			
	
	// types
	_.each(config.types, function(type) {
		if (type.plural) {
			app.all('/'+ type.plural, attachDB, function(req, res, next) {
				List.run({
					type: type.name
				}, req, res, next);
			});	
			app.all('/'+ type.name +'/:id', attachDB, function(req, res, next) {
				Page.run({
					ID: req.params.id
				}, req, res, next);
			});	
		} else {
			app.all('/'+ type.name, attachDB, function(req, res, next) {
				Page.run({
					type: type.name
				}, req, res, next);
			});	
		}
	});
		
	http.createServer(app).listen(config.port, function() {
	  	console.log(
	  		'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.dbname,
	  		'\nExpress server listening on port ' + config.port
	  	);
	});
});