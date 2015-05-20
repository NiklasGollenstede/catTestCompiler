'use strict';
/* global global */
/* global traceur */
/* global process */

import { Execute, Path, FS, exitWith, fuzzyMatch, promisify, spawn } from './util.js';

Promise.prototype.end = function(...args) {
	this.catch(console.error.bind(console, 'Promise chain failed with:', ...args));
	return Promise.reject('Promise chain is already terminated'+ args);
};

const expectedTypes = Object.freeze([
	'button',
	'interface',
	'floor',
	'elevator',
	'person',
	'event',
]);

function compile(object, { autoAlias, autoType, }) {
	const objects = new Map();
	objects.set(null, 0);

	const newId = ((c = 100) => () => ++c)();

	const giveIds = object => {
		Object.keys(object).forEach(key => {
			if (object[key] instanceof Object) {
				if (!objects.has(object[key])) {
					if (!(object[key] instanceof Array)) {
						let id = newId();
						objects.set(object[key], id);
						if (autoAlias && !object[key].alias) {
							object[key].alias = key;
						}
						if (object[key].alias) {
							objects.set(object[key].alias, id);
						}
					}
					giveIds(object[key]);
				}
			}
		});
	};
	giveIds(object);

	// objects.forEach((id, object) => console.log(id, ' => '+ object));

	let out = '';

	objects.forEach((id, object) => {
		if (!(object instanceof Object)) { return; }

		// automated type detection
		if (autoType && !object.type && typeof object.alias === 'string') {
			object.type = expectedTypes[expectedTypes.map(type => fuzzyMatch(type, object.alias)).reduce((o, v, i) => v > o.v ? { v, i, } : o, { v: 0, i: -1}).i];
		}

		switch (object.type) {
			case 'button': {
				out += 'UpDownButton { '+ [
					id,
					object.entities.length,
					...object.entities.map(object => objects.get(object)),
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case 'interface': {
				out += 'Interface { '+ [
					id,
					object.entities.length,
					...object.entities.map(object => objects.get(object)),
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case 'floor': {
				out += 'Floor { '+ [
					id,
					objects.get(object.below),
					objects.get(object.above),
					object.height,
					object.interfaces.length,
					...object.interfaces.map(object => objects.get(object)),
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case 'elevator': {
				out += 'Elevator { '+ [
					id,
					object.speed,
					object.load,
					objects.get(object.start),
					object.interfaces.length,
					...object.interfaces.map(object => objects.get(object)),
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case 'person': {
				out += 'Person { '+ [
					id,
					objects.get(object.from),
					objects.get(object.to),
					object.time,
					object.wight,
					object.start,
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case 'event': {
				out += 'Event { '+ [
					object.name,
					object.time,
					objects.get(object.sender),
					objects.get(object.object),
					(object.data +'').replace(/ /g, '_'),
				].map(s => s +'').join(' ') +' }\n';
			} break;
			case null: {
			} break;
			default: {
				console.log('WARNING: unkown type:', object.type);
			}
		}
	});

	return out;
}

export const main = (dir, { files: { 0: src, 1: dest, }, autoAlias, autoType, cat: catExec }) => spawn(function*() {

	let mode = Path.basename(dir, '.js');
	dir = Path.dirname(dir);
	src = Path.resolve(dir, src);
	dest = Path.resolve(dir, dest);
	catExec = catExec && Path.resolve(dir, catExec);

	console.log(mode, src, 'to', dest);

	!(yield FS.exists(src)) && exitWith('source '+ src +' doesn\'t exist');
	!(yield FS.exists(dest)) && exitWith('destioation '+ dest +' doesn\'t exist');

	let files = [ src ];
	try {
		files = yield FS.listDir(src);
	} catch (error) {
		if (error.code !== 'ENOTDIR') { throw error; }
	}

	files = files.filter(path => (/\.js$/).test(path)).sort();
	console.log('found '+ files.length +' file(s)');

	let errors = yield Promise.all(files.map(file => spawn(function*() {
		if (!(yield FS.stat(file)).isFile()) { return; }

		const test = Object.assign({ }, (yield traceur.import(file, { })));

		const out = compile(test, { autoAlias, autoType, });

		const target = Path.resolve(dest, Path.relative(src, file) || Path.basename(file)).replace(/.\w+$/, '.txt');

		// console.log(out ,'=> ', target);

		try {
			yield FS.makeDir(Path.dirname(target));
			yield FS.writeFile(target, out);
			console.log('wrote to file', target);
		} catch (error) {
			console.error(error);
			return error;
		}

		if (catExec) {
			try {
				let result = (yield Execute(catExec, [ target ], { env: process.env, })).split('\n');
				console.log(result[result.length - 2]);
			} catch (error) {
				console.error('Execution of:\n\t'+ catExec +' '+ target +'\nterminated abnormally:\n', error);
			}
		}

	})));

}).catch(error => {
	exitWith('uncought exception\n', error, '\n terminating');
});
