
/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'), 
	config = require('./config')('local'),
	//config = require('./config')('bae'),
	app = express(),
	Admin = require('./controllers/Admin')(config.admin),
	Home = require('./controllers/Home'),
	Blog = require('./controllers/Blog'),
	Page = require('./controllers/Page'),
	dbinit = require('./lib/dbinit');


// all environments
app.set('view engine', 'hjs');
app.set('views', __dirname + '/templates');
app.use(express.favicon());
//app.use(express.logger('dev'));	// problem on bae
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: config.secret
}));
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(__dirname + '/public'));
app.use(express.errorHandler({
	dumpExceptions: true, showStack: true
}));


dbinit(config.mongo, function(err, db) {
	if (err) {
		db.close();
		console.error('Sorry, there is a problem with mongo db server.');
		return;
	}
	var attachDB = function(req, res, next) {
		req.db = db;
		next();
	};
	app.all('/admin*', attachDB, function(req, res, next) {
		Admin.run(req, res, next);
	});			
	app.all('/blog/:id', attachDB, function(req, res, next) {
		Blog.runArticle(req, res, next);
	});	
	app.all('/blog', attachDB, function(req, res, next) {
		Blog.run(req, res, next);
	});	
	app.all('/services', attachDB, function(req, res, next) {
		Page.run('services', req, res, next);
	});	
	app.all('/careers', attachDB, function(req, res, next) {
		Page.run('careers', req, res, next);
	});	
	app.all('/contacts', attachDB, function(req, res, next) {
		Page.run('contacts', req, res, next);
	});	
	app.all('/', attachDB, function(req, res, next) {
		Home.run(req, res, next);
	});		
	http.createServer(app).listen(config.port, function() {
	  	console.log(
	  		'Successfully connected to mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.dbname,
	  		'\nExpress server listening on port ' + config.port
	  	);
	});
});