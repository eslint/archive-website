// requires
var espree = require('espree');

exports.parse = function(config) {
	var code = editor.value;
	var ast = espree.parse(code, config); // throws...
	return JSON.stringify(ast, null, '  ');
};