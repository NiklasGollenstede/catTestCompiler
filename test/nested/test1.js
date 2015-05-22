'use strict';

import { Building, Elevator, Croud, } from 'testhelper.js';

export const floors = new Building(20/*, () => 3- -Math.floor(Math.random() * 4)*/);

export const elevators = (() => {
	let elevators = [ ];

	elevators.push(new Elevator(floors));
	elevators.push(new Elevator(floors));
	elevators.push(new Elevator(floors));
	elevators.push(new Elevator(floors));
	elevators.push(new Elevator(floors));
	elevators.push(new Elevator(floors));

	return elevators;
})();

export const people = (() => {
	let people = [ ];

	people.push(...new Croud(10, {
		from: () => floors[0],
		to: () => floors[floors.length - 1],
		time: () => 10000,
	}, 0));

	return people;
})();
