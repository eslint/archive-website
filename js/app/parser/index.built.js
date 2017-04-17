(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// requires
var config = require('./parser.config');
var lib = require('./lib');

// DOM stuff
var editor = document.querySelector('#editor');
var results = document.querySelector('#results');
var controls = document.querySelector('#configuration');

function handleSelectChange(property, el, typeFunc) {
	var selected = typeFunc(el.value);
	config[property] = selected;
}

function toggleOption(option, property) {
	if (property) {
		config[property][option] = !config[property][option];
	} else {
		config[option] = !config[option];
	}
}

function drawCheckboxes(config, property) {
	var el = document.querySelector('.' + (property || 'options'));

	// convert the list of options into checkboxes
	var checkboxes = Object.keys(config).filter(function(option) {
		return typeof config[option] === 'boolean';
	}).map(function(option) {
		var checked = config[option] ? ' checked ' : ' ';
		return '<div class="checkbox"><label><input' + checked + 'type="checkbox" class="option-checkbox" id="' + option + '" />' + option + '</label></div>';
	});

	el.innerHTML = checkboxes.join('');
	el.onchange = function(event) {
		toggleOption(event.target.id, property);
	}

}

function drawSelectBoxes(config, property, typeFunc) {
	var el = document.querySelector('.' + property);
	var select = document.createElement('select');
	var options = Object.keys(config).filter(function(option) {
		return typeof config[option] === 'boolean';
	}).map(function(option) {
		var selected = config[option] ? ' selected ' : ' ';
		return '<option ' + selected + ' value="' + option + '">' + option +'</option>';
	});
	select.innerHTML = options;
	select.onchange = function(event) {
		handleSelectChange(property, event.target, typeFunc);
	};
	el.appendChild(select);

	// reset the config to take the currently selected value
	handleSelectChange(property, select, typeFunc);
}

function drawVersion() {
	document.getElementById('version').innerHTML = lib.getVersion();
}

function setupControls() {
	drawVersion();
	drawCheckboxes(config);
	drawCheckboxes(config.ecmaFeatures, "ecmaFeatures");
	drawSelectBoxes(config.ecmaVersion, "ecmaVersion", Number);
	drawSelectBoxes(config.sourceType, "sourceType", String);
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
		ast = lib.parse(editor.value, config);
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

exports.parse = function(code, config) {
	var ast = espree.parse(code, config); // throws...
	return JSON.stringify(ast, null, '  ');
};

exports.getVersion = function() {
	return espree.version;
};

},{"espree":"espree"}],3:[function(require,module,exports){
module.exports = {
	range: false,
	loc: false,
	comments: false,
	attachComment: false,
	tokens: false,
	ecmaVersion: {
		3: false,
		5: false,
		6: true,
		7: false,
		8: false
	},
	sourceType: {
		script: false,
		module: true
	},
	ecmaFeatures: {
		jsx: true,
		globalReturn: true,
		impliedStrict: false,
		experimentalObjectRestSpread: true
	}
};

},{}]},{},[1]);
