'use strict'; /* global global */

global.require = require;
global.traceur = require('traceur/src/node/System.js');

var Options = require('command-line-args')([
    { name: 'help', alias: 'h', type: Boolean, description: 'Print usage instructions' },
    { name: 'autoAlias', alias: 'a', type: Boolean, description: 'use variable names as aliases, if no alias is set' },
    { name: 'autoType', alias: 't', type: Boolean, description: 'use alases to guess types, if no type is set' },
    { name: 'cat', alias: 'c', description: 'optional path to a CAT binary that will be used to run the compiled tests' },
    { name: 'files', type: Array, defaultOption: true, description: 'The input file or folder followed by the output folder' }
]);

var options = Options.parse();
if (options.help || !options.files || options.files.length !== 2) {
	console.log(Options.getUsage({
		header: 'Transforms JavaScript files modelling test cases into CAT parsable files\n'+
				'\n\te.g. ``node compile ./src ./out -t -a --cat "../path/to/cat.exe"´´',
		footer: '',
	}));
	return;
}

global.traceur.import('./compiler.js', global).then(function(module) {

	module.main(global.process.argv[1], options);

}).catch(function(error) {
	console.error(error);
});
