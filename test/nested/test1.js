'use strict';

import { Building, Elevator, Croud, } from 'testhelper.js';

export const floors = new Building(400/*, () => 3- -Math.floor(Math.random() * 4)*/);

export const elevators = (() => {
	let elevators = [ ];

	elevators.push(...new Elevator(floors, 2, {
		speed: () => 5,
		load: () => 25,
		start: i => Math.floor(i * (floors.length / 8)),
	}));
	elevators.push(...new Elevator(floors.slice(0, floors.length /2), 5));
	elevators.push(...new Elevator(floors.slice(floors.length /2), 5));
	elevators.push(...new Elevator(floors));

	return elevators;
})();

export const people = (() => {
	let people = [ ];

	people.push(...new Croud(30, {
		from: () => floors[0],
		to: () => floors[floors.length - 1],
		time: () => 10000,
	}, 0));

	return people;
})();
