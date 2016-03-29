// requires
var config = require('./parser.config');
var lib = require('./lib');

// DOM stuff
var editor = document.querySelector('#editor');
var results = document.querySelector('#results');
var controls = document.querySelector('#configuration');

function handleSelectChange(property, el) {
	var selected = el.value;
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

function drawSelectBoxes(config, property) {
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
		handleSelectChange(property, event.target);
	};
	el.appendChild(select);

	// reset the config to take the currently selected value
	handleSelectChange(property, select);
}

function drawVersion() {
	document.getElementById('version').innerHTML = lib.getVersion();
}

function setupControls() {
	drawVersion();
	drawCheckboxes(config);
	drawCheckboxes(config.ecmaFeatures, "ecmaFeatures");
	drawSelectBoxes(config.ecmaVersion, "ecmaVersion");
	drawSelectBoxes(config.sourceType, "sourceType");
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