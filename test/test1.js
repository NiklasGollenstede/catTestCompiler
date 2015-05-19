'use strict';

export const interface1 = {
	/*type: 'interface',*/
	entities: [ 'elevator1' ],
};

export const floor10 = {
	/*type: 'floor',*/
	below: 'floor11',
	above: null,
	height: 4,
	interfaces: [ interface1, ],
};

export const floor11 = {
	/*type: 'floor',*/
	/*alias: 'floor11',*/
	below: null,
	above: floor10,
	height: 4,
	interfaces: [ interface1, ],
};

export const elevator1 = {
	/*type: 'elevator',*/
	speed: 1,
	load: 10,
	start: floor11,
	interfaces: [
		{
			type: 'interface',
			entities: [ floor11, ],
		},
		{
			type: 'interface',
			entities: [ floor10, ],
		},
	],
};

export const person1 = {
	/*type: 'person',*/
	from: floor11,
	to: floor10,
	time: 10,
	wight: 5,
	start: 0,
};

export const event1 = {
	/*type: 'event',*/
	name: 'unexpected',
	time: 10,
	sender: interface1,
	object: person1,
	data: 'strange stuff',
};
