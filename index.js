const Promise = require('bluebird');
const SetBucket = require('./SetBucket');
const SubclassError = require('subclass-error');

Promise.config({
  longStackTraces: true
});

module.exports = function (opts) {

	const bucket = new SetBucket(opts.bucketSize);
	let freeTickets = opts.ticketsPerInterval;

	const interval = setInterval(function replenish () {
		freeTickets = opts.ticketsPerInterval;
		drip();
	}, opts.interval);

	function drip() {
		let ticket;
		while(freeTickets-- > 0) {
			console.log('tickets: ', freeTickets);
			ticket = bucket.take();
			if (ticket === null) {
				break;
			}
			clearTimeout(ticket.timeout);
			ticket.resolve();
		}
	}

	const limiter = function () {

		let timeout;

		return new Promise(function (resolve, reject) {
			let t = setTimeout(function () {
				bucket.remove(ticket);
				reject(new module.exports.timeoutError());
			}, opts.timeout);
			const ticket = {
				timeout: t,
				resolve: resolve,
				reject: reject
			};
			if (freeTickets > 0) {
				resolve();
				freeTickets--;
				return;
			}
			var didAdd = bucket.add(ticket);
			if (!didAdd) {
				ticket.reject(new module.exports.bucketFullError());
			}
		});

	};

	limiter.stop = function () {
		clearInterval(interval);
		bucket.empty();
	};

	return limiter;

};

module.exports.timeoutError = SubclassError('Timeout');
module.exports.bucketFullError = SubclassError('Bucket full');
