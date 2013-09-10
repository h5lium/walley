var mongodb = require('mongodb');

module.exports = function(config, callback){
	config.host = config.host || '127.0.0.1';
	config.port = config.port || 27017;
	
	// open db
	var db = new mongodb.Db(config.dbname, new mongodb.Server(config.host, config.port, {}), {w: 1});
	db.open(function(err, db) {
		if (err) {
			console.error('Connect failed!');
			callback(err, db);
			return;
		}
		if (config.username) {
			db.authenticate(config.username, config.password, function(err, reply) { 
				if (err) {
					console.error('Authenticate failed!');
				}
				callback(err, db);
			});
		} else {
			callback(err, db);
		}
	});
}