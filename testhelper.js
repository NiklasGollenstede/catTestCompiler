'use strict';

const fixed = (id) => ('000'+ id).slice(-3);

export const Building = function(heigth, floorHeight = () => 4) {
	let floors = [];
	let below = null;
	for (let i = 0; i < heigth; i++) {
		let self = {
			alias: 'floor'+ fixed(i),
			index: i,
			above: null,
			below: below,
			height: floorHeight(),
			interfaces: [],
		};
		below && (below.above = self);
		floors.push(self);
		below = self;
	}
	return floors;
};

export const Elevator = (() => {
	let count = 50000;
	const def = {
		speed: () => 1,
		load: () => 10,
		start: () => 0,
	};
	return function(floors, number = 1, { speed = def.speed, load = def.load, start = def.start, } = def, index = ++count) {
		let elevators = Array(number);

		let interfaces = floors.map(floor => ({
			alias: 'interface02'+ fixed(floor.index) + fixed(index),
			entities: [ floor ],
		}));

		for (let i = 0; i < number; i++) {
			elevators[i] = {
				alias: 'elevator'+ fixed(index) +''+ fixed(i),
				speed: speed(i),
				load: load(i),
				start: (start => typeof start === 'number' ? floors[start] : start)(start(i)),
				interfaces: interfaces,
			};
		}

		floors.forEach(floor => floor.interfaces.push({
			alias: 'button01'+ fixed(floor.index) +''+ fixed(index),
			entities: elevators,
		}));

		floors[0].interfaces.pop();
		floors[0].interfaces.push({
			alias: 'interface01'+ fixed(0) +''+ fixed(index),
			entities: elevators,
		});

		floors[floors.length - 1].interfaces.pop();
		floors[floors.length - 1].interfaces.push({
			alias: 'interface01'+ fixed(floors.length - 1) +''+ fixed(index),
			entities: elevators,
		});

		return elevators;
	};
})();

export const Croud = (() => {
	let count = 50000;
	const def = {
		start: () => 0,
		weight: () => 5,
	};
	return function(size, { from, to, time, start = def.start, weight = def.weight, }, index = ++count) {
		let people = Array(size);

		for (let i = 0; i < size; i++) {
			people[i] = {
				alias: 'person'+ fixed(i + index),
				from: from(i),
				to: to(i),
				time: time(i),
				start: start(i),
				wight: weight(i),
			};
		}

		return people;
	};
})();
