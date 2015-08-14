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
