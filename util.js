'use strict';
/* global process */


export const promisify = function(async, thisArg) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		return new Promise(function(resolve, reject) {
			args.push(function(err, res) { err ? reject(err) : resolve(res); });
			async.apply(thisArg, args);
		});
	};
};

var fs = require('fs');
var path = require('path');
var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) { return done(err); }
		var pending = list.length;
		if (!pending) { return done(null, results); }
		list.forEach(function(file) {
			file = path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						if (!--pending) { done(null, results); }
					});
				} else {
					results.push(file);
					if (!--pending) { done(null, results); }
				}
			});
		});
	});
};

export const Path = require('path');
export const FS = Object.assign({ }, require('fs'));
FS.makeDir = promisify(require('mkdirp'));
FS.listDir = promisify(walk);
Object.keys(FS).forEach(key => {
	if (!(/Sync$/.test(key))) { return; }
	key = key.slice(0, -4);
	FS[key] = promisify(FS[key]);
});


export const exitWith = string => (console.log('FATAL: '+ string), process.exit(-1));

export function fuzzyMatch(a, b) {
	[a, b] = [a, b].map(s => s.toLowerCase());
	let l = 0;
	while (a[l] && a[l] === b[l]) { ++l; }
	return l;
}
