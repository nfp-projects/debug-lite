/* eslint-env mocha */
const assert = require('assert');
const expect = require('expect.js');
const debug = require('./src');
const ms = require('./src/ms');

describe('debug', () => {
	it('passes a basic sanity check', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		assert.doesNotThrow(() => log('hello world'));
	});

	it('allows namespaces to be a non-string value', () => {
		const log = debug('test');
		log.enabled = true;
		log.log = () => {};

		assert.doesNotThrow(() => debug.enable(true));
	});

	it('honors global debug namespace enable calls', () => {
		assert.deepStrictEqual(debug('test:12345').enabled, false);
		assert.deepStrictEqual(debug('test:67890').enabled, false);

		debug.enable('test:12345');
		assert.deepStrictEqual(debug('test:12345').enabled, true);
		assert.deepStrictEqual(debug('test:67890').enabled, false);
	});

	it('uses custom log function', () => {
		const log = debug('test');
		log.enabled = true;

		const messages = [];
		log.log = (...args) => messages.push(args);

		log('using custom log function');
		log('using custom log function again');
		log('%O', 12345);

		assert.deepStrictEqual(messages.length, 3);
	});

	describe('extend namespace', () => {
		it('should extend namespace', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar');
			assert.deepStrictEqual(logBar.namespace, 'foo:bar');
		});

		it('should extend namespace with custom delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '--');
			assert.deepStrictEqual(logBar.namespace, 'foo--bar');
		});

		it('should extend namespace with empty delimiter', () => {
			const log = debug('foo');
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend('bar', '');
			assert.deepStrictEqual(logBar.namespace, 'foobar');
		});

		it('should keep the log function between extensions', () => {
			const log = debug('foo');
			log.log = () => {};

			const logBar = log.extend('bar');
			assert.deepStrictEqual(log.log, logBar.log);
		});
	});

	describe('rebuild namespaces string (disable)', () => {
		it('handle names, skips, and wildcards', () => {
			debug.enable('test,abc*,-abc');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, 'test,abc*,-abc');
		});

		it('handles empty', () => {
			debug.enable('');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '');
			assert.deepStrictEqual(debug.names, []);
			assert.deepStrictEqual(debug.skips, []);
		});

		it('handles all', () => {
			debug.enable('*');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '*');
		});

		it('handles skip all', () => {
			debug.enable('-*');
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, '-*');
		});

		it('names+skips same with new string', () => {
			debug.enable('test,abc*,-abc');
			const oldNames = [...debug.names];
			const oldSkips = [...debug.skips];
			const namespaces = debug.disable();
			assert.deepStrictEqual(namespaces, 'test,abc*,-abc');
			debug.enable(namespaces);
			assert.deepStrictEqual(oldNames.map(String), debug.names.map(String));
			assert.deepStrictEqual(oldSkips.map(String), debug.skips.map(String));
		});
	});
});

describe('ms(string)', () => {
	it('should not throw an error', () => {
		expect(() => {
			ms('1m');
		}).to.not.throwError();
	});

	it('should preserve ms', () => {
		expect(ms('100')).to.be(100);
	});

	it('should convert from m to ms', () => {
		expect(ms('1m')).to.be(60000);
	});

	it('should convert from h to ms', () => {
		expect(ms('1h')).to.be(3600000);
	});

	it('should convert d to ms', () => {
		expect(ms('2d')).to.be(172800000);
	});

	it('should convert w to ms', () => {
		expect(ms('3w')).to.be(1814400000);
	});

	it('should convert s to ms', () => {
		expect(ms('1s')).to.be(1000);
	});

	it('should convert ms to ms', () => {
		expect(ms('100ms')).to.be(100);
	});

	it('should work with decimals', () => {
		expect(ms('1.5h')).to.be(5400000);
	});

	it('should work with multiple spaces', () => {
		expect(ms('1   s')).to.be(1000);
	});

	it('should return NaN if invalid', () => {
		expect(isNaN(ms('☃'))).to.be(true);
		expect(isNaN(ms('10-.5'))).to.be(true);
	});

	it('should be case-insensitive', () => {
		expect(ms('1.5H')).to.be(5400000);
	});

	it('should work with numbers starting with .', () => {
		expect(ms('.5ms')).to.be(0.5);
	});

	it('should work with negative integers', () => {
		expect(ms('-100ms')).to.be(-100);
	});

	it('should work with negative decimals', () => {
		expect(ms('-1.5h')).to.be(-5400000);
		expect(ms('-10.5h')).to.be(-37800000);
	});

	it('should work with negative decimals starting with "."', () => {
		expect(ms('-.5h')).to.be(-1800000);
	});
});

// Long strings

describe('ms(long string)', () => {
	it('should not throw an error', () => {
		expect(() => {
			ms('53 milliseconds');
		}).to.not.throwError();
	});

	it('should convert milliseconds to ms', () => {
		expect(ms('53 milliseconds')).to.be(53);
	});

	it('should convert msecs to ms', () => {
		expect(ms('17 msecs')).to.be(17);
	});

	it('should convert sec to ms', () => {
		expect(ms('1 sec')).to.be(1000);
	});

	it('should convert from min to ms', () => {
		expect(ms('1 min')).to.be(60000);
	});

	it('should convert from hr to ms', () => {
		expect(ms('1 hr')).to.be(3600000);
	});

	it('should convert days to ms', () => {
		expect(ms('2 days')).to.be(172800000);
	});

	it('should work with decimals', () => {
		expect(ms('1.5 hours')).to.be(5400000);
	});

	it('should work with negative integers', () => {
		expect(ms('-100 milliseconds')).to.be(-100);
	});

	it('should work with negative decimals', () => {
		expect(ms('-1.5 hours')).to.be(-5400000);
	});

	it('should work with negative decimals starting with "."', () => {
		expect(ms('-.5 hr')).to.be(-1800000);
	});
});

// Numbers

describe('ms(number, { long: true })', () => {
	it('should not throw an error', () => {
		expect(() => {
			ms(500, {long: true});
		}).to.not.throwError();
	});

	it('should support milliseconds', () => {
		expect(ms(500, {long: true})).to.be('500 ms');

		expect(ms(-500, {long: true})).to.be('-500 ms');
	});

	it('should support seconds', () => {
		expect(ms(1000, {long: true})).to.be('1 second');
		expect(ms(1200, {long: true})).to.be('1 second');
		expect(ms(10000, {long: true})).to.be('10 seconds');

		expect(ms(-1000, {long: true})).to.be('-1 second');
		expect(ms(-1200, {long: true})).to.be('-1 second');
		expect(ms(-10000, {long: true})).to.be('-10 seconds');
	});

	it('should support minutes', () => {
		expect(ms(60 * 1000, {long: true})).to.be('1 minute');
		expect(ms(60 * 1200, {long: true})).to.be('1 minute');
		expect(ms(60 * 10000, {long: true})).to.be('10 minutes');

		expect(ms(-1 * 60 * 1000, {long: true})).to.be('-1 minute');
		expect(ms(-1 * 60 * 1200, {long: true})).to.be('-1 minute');
		expect(ms(-1 * 60 * 10000, {long: true})).to.be('-10 minutes');
	});

	it('should support hours', () => {
		expect(ms(60 * 60 * 1000, {long: true})).to.be('1 hour');
		expect(ms(60 * 60 * 1200, {long: true})).to.be('1 hour');
		expect(ms(60 * 60 * 10000, {long: true})).to.be('10 hours');

		expect(ms(-1 * 60 * 60 * 1000, {long: true})).to.be('-1 hour');
		expect(ms(-1 * 60 * 60 * 1200, {long: true})).to.be('-1 hour');
		expect(ms(-1 * 60 * 60 * 10000, {long: true})).to.be('-10 hours');
	});

	it('should support days', () => {
		expect(ms(24 * 60 * 60 * 1000, {long: true})).to.be('1 day');
		expect(ms(24 * 60 * 60 * 1200, {long: true})).to.be('1 day');
		expect(ms(24 * 60 * 60 * 10000, {long: true})).to.be('10 days');

		expect(ms(-1 * 24 * 60 * 60 * 1000, {long: true})).to.be('-1 day');
		expect(ms(-1 * 24 * 60 * 60 * 1200, {long: true})).to.be('-1 day');
		expect(ms(-1 * 24 * 60 * 60 * 10000, {long: true})).to.be('-10 days');
	});

	it('should round', () => {
		expect(ms(234234234, {long: true})).to.be('3 days');

		expect(ms(-234234234, {long: true})).to.be('-3 days');
	});
});

// Numbers

describe('ms(number)', () => {
	it('should not throw an error', () => {
		expect(() => {
			ms(500);
		}).to.not.throwError();
	});

	it('should support milliseconds', () => {
		expect(ms(500)).to.be('500ms');

		expect(ms(-500)).to.be('-500ms');
	});

	it('should support seconds', () => {
		expect(ms(1000)).to.be('1s');
		expect(ms(10000)).to.be('10s');

		expect(ms(-1000)).to.be('-1s');
		expect(ms(-10000)).to.be('-10s');
	});

	it('should support minutes', () => {
		expect(ms(60 * 1000)).to.be('1m');
		expect(ms(60 * 10000)).to.be('10m');

		expect(ms(-1 * 60 * 1000)).to.be('-1m');
		expect(ms(-1 * 60 * 10000)).to.be('-10m');
	});

	it('should support hours', () => {
		expect(ms(60 * 60 * 1000)).to.be('1h');
		expect(ms(60 * 60 * 10000)).to.be('10h');

		expect(ms(-1 * 60 * 60 * 1000)).to.be('-1h');
		expect(ms(-1 * 60 * 60 * 10000)).to.be('-10h');
	});

	it('should support days', () => {
		expect(ms(24 * 60 * 60 * 1000)).to.be('1d');
		expect(ms(24 * 60 * 60 * 10000)).to.be('10d');

		expect(ms(-1 * 24 * 60 * 60 * 1000)).to.be('-1d');
		expect(ms(-1 * 24 * 60 * 60 * 10000)).to.be('-10d');
	});

	it('should round', () => {
		expect(ms(234234234)).to.be('3d');

		expect(ms(-234234234)).to.be('-3d');
	});
});

// Invalid inputs

describe('ms(invalid inputs)', () => {
	it('should throw an error, when ms("")', () => {
		expect(() => {
			ms('');
		}).to.throwError();
	});

	it('should throw an error, when ms(undefined)', () => {
		expect(() => {
			ms(undefined);
		}).to.throwError();
	});

	it('should throw an error, when ms(null)', () => {
		expect(() => {
			ms(null);
		}).to.throwError();
	});

	it('should throw an error, when ms([])', () => {
		expect(() => {
			ms([]);
		}).to.throwError();
	});

	it('should throw an error, when ms({})', () => {
		expect(() => {
			ms({});
		}).to.throwError();
	});

	it('should throw an error, when ms(NaN)', () => {
		expect(() => {
			ms(NaN);
		}).to.throwError();
	});

	it('should throw an error, when ms(Infinity)', () => {
		expect(() => {
			ms(Infinity);
		}).to.throwError();
	});

	it('should throw an error, when ms(-Infinity)', () => {
		expect(() => {
			ms(-Infinity);
		}).to.throwError();
	});
});
