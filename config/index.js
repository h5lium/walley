
var _ = require('underscore');

module.exports = function(mode) {
	var config = mode !== 'test' ?
	require('./private/'+ mode +'.mode.js') : {
		mode: 'test',
		port: 3000,
		mongo: {
			host: '127.0.0.1',
			port: 27017,
			dbname: 'walley-test'
		},
		admin: {
			username: 'admin',
			password: 'admin'
		},
		secret: 'abc',
		tmpDir: __dirname + '/../public/tmp'
	};
	
	return _.extend(config, {
		types: require('./ctn-types.js')
	});
}