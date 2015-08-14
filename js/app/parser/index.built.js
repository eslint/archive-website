(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// requires
var config = require('./parser.config');
var lib = require('./lib');

// DOM stuff
var editor = document.querySelector('#editor');
var results = document.querySelector('#results');
var controls = document.querySelector('#configuration');
var optionsControl = document.querySelector('.options .list');

function handleBodyClick(event) {
	if (event.target.classList.contains('option-checkbox')) {
		toggleControl(event.target.id);
	}
}

function toggleControl(id) {
	config[id] = !config[id];
}

function setupControls() {
	// setup basic handler for all clicks
	document.body.onclick = handleBodyClick;

	// convert the list of options into checkboxes
	var checkboxes = Object.keys(config).filter(function(option) {
		return typeof config[option] === 'boolean';
	}).map(function(option) {
		var checked = config[option] ? ' checked ' : ' ';
		return '<div class="checkbox-inline"><label><input' + checked + 'type="checkbox" class="option-checkbox" id="' + option + '" />' + option + '</label></div>';
	});

	// append the checkboxes to the control list
	optionsControl.innerHTML = checkboxes.join('');
}

function showError(error) {
	console.log(error);
	results.classList.add('error');
	results.innerHTML = error.message;
	console.warn(error.message);
}

function parseForever() {
	var ast;
	try {
		ast = lib.parse(config);
		results.classList.remove('error');
		results.innerHTML = ast;
	} catch(error) {
		showError(error);
	}
	setTimeout(parseForever, 1000)
}

// set everything up
setupControls();
parseForever();

},{"./lib":2,"./parser.config":3}],2:[function(require,module,exports){
// requires
var espree = require('espree');

exports.parse = function(config) {
	var code = editor.value;
	var ast = espree.parse(code, config); // throws...
	return JSON.stringify(ast, null, '  ');
};
},{"espree":"espree"}],3:[function(require,module,exports){
module.exports = {
	range: false,
	loc: false,
	comments: false,
	attachComment: false,
	tokens: false,
	tolerant: true,
	ecmaFeatures: {
		arrowFunctions: true,
		blockBindings: true,
		destructuring: true,
		regexYFlag: true,
		regexUFlag: true,
		templateStrings: true,
		binaryLiterals: true,
		octalLiterals: true,
		unicodeCodePointEscapes: true,
		defaultParams: true,
		restParams: true,
		forOf: true,
		objectLiteralComputedProperties: true,
		objectLiteralShorthandMethods: true,
		objectLiteralShorthandProperties: true,
		objectLiteralDuplicateProperties: true,
		generators: true,
		spread: true,
		superInFunctions: true,
		classes: true,
		newTarget: false,
		modules: true,
		jsx: true,
		globalReturn: true,
		experimentalObjectRestSpread: true
	}
};

},{}]},{},[1]);
