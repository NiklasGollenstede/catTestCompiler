'use strict';
/* global global */
/* global traceur */
/* global process */

import { Path, FS, exitWith, fuzzyMatch, promisify } from './util.js';

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

	const newId = ((c = 0) => () => ++c)();

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
					'"'+ object.name +'"',
					object.time,
					objects.get(object.sender),
					objects.get(object.object),
					'"'+ object.data +'"',
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

export const main = (dir, { files: { 0: src, 1: dest, }, autoAlias, autoType }) => {

	console.log(autoAlias, autoType);

	let mode = Path.basename(dir, '.js');
	dir = Path.dirname(dir);
	src = Path.resolve(dir, src);
	dest = Path.resolve(dir, dest);

	console.log(mode, src, 'to', dest);

	!FS.existsSync(src) && exitWith('source '+ src +' doesn\'t exist');
	!FS.existsSync(dest) && exitWith('destioation '+ dest +' doesn\'t exist');


	FS.listDir(src)
	.catch(error => error.code == 'ENOTDIR' ? [ src ] : Promise.reject(error))
	.then(files => {
		files.filter(path => (/\.js$/.test(path)));
		console.log('found '+ files.length +' file(s)');

		files.forEach(file =>
			FS.stat(file)
			.then(stat =>
				traceur.import(file, { })
				.then(test => {
					test = Object.keys(test).reduce((object, key) => ((object[key] = test[key]), object), { });

					const out = compile(test, { autoAlias, autoType, });

					const target = Path.resolve(dest, Path.relative(src, file) || Path.basename(file)).replace(/.\w+$/, '.txt');

					console.log(out ,'=> ', target);

					FS.makeDir(Path.dirname(target))
					.then(() => FS.writeFile(target, out))
					.then(() => console.log('wrote to file', target))
					.catch(error => console.error(error));

				})
			)
			.end()
		);

		//exitWith('source '+ src +'is neither file nor directory');
	})
	.end();
};
