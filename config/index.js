
var config = {
	local: {
		mode: 'local',
		port: 3000,
		mongo: {
			host: '127.0.0.1',
			port: 27017,
			dbname: 'walley'
		},
		admin: {
			username: 'admin',
			password: 'admin'
		},
		secret: 'abc'
	},
	bae: require('./private/bae.conf.js')
}

module.exports = function(mode) {
	return config[mode || process.argv[2] || 'local'];
}