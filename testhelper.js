'use strict';

export const Building = function(heigth, floorHeight = () => 4) {
	let floors = [];
	let below = null;
	for (var i = 0; i < heigth; i++) {
		let self = {
			alias: 'floor'+ i,
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
	let count = 500; // TODO test ++count as default
	return function(floors, { speed = 1, load = 10, start = 0, } = { }, index = ++count) {
		let elevator = {
			alias: 'elevator'+ index,
			speed: speed,
			load: load,
			start: typeof start === 'number' ? floors[start] : start,
			interfaces: floors.map(floor => ({
				alias: 'interface'+ floor.index +''+ index +'2',
				entities: [ floor ],
			})),
		};

		floors.forEach(floor => floor.interfaces.push({
			alias: 'button'+ floor.index +''+ index +'1',
			entities: [ elevator ],
		}));

		floors[0].interfaces.pop();
		floors[0].interfaces.push({
			alias: 'interface'+ 0 +''+ index +'1',
			entities: [ elevator ],
		});

		floors[floors.length - 1].interfaces.pop();
		floors[floors.length - 1].interfaces.push({
			alias: 'interface'+ (floors.length - 1) +''+ index +'1',
			entities: [ elevator ],
		});

		return elevator;
	};
})();

export const Croud = (() => {
	let count = 500; // TODO test ++count as default
	return function(size, { from, to, time, start = () => 0, weight = () => 5, }, index = ++count) {
		let people = Array(size);

		for (var i = 0; i < size; i++) {
			people[i] = {
				alias: 'person'+ (i + index),
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
