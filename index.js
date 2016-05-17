const Promise = require('bluebird');
const SetBucket = require('./SetBucket');

module.exports = function (opts) {

	const bucket = new SetBucket();

	return function () {

		let timeout;

		const ticket = new Promise(function (reject, resolve) {
			timeout = setTimeout(reject, opts.timeout);
			bucket.add();
		});

	};

};
