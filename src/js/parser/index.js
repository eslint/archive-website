import config from "./parser.config";
import lib from "./lib";
import "../../styles/parser.less";

// DOM stuff
const editor = document.querySelector("#editor");
const results = document.querySelector("#results");

function handleSelectChange(property, el) {
    let selected = el.value;

    // espree validates that ecmaVersion is a number
    if (property === "ecmaVersion") {
        selected = parseInt(selected, 10);
    }

    config[property] = selected;
}

function toggleOption(option, property) {
    if (property) {
        config[property][option] = !config[property][option];
    } else {
        config[option] = !config[option];
    }
}

function drawCheckboxes(boxesConfig, property) {
    const el = document.querySelector(`.${property || "options"}`);

    // convert the list of options into checkboxes
    const checkboxes = Object.keys(boxesConfig).filter(option => typeof boxesConfig[option] === "boolean").map(option => {
        const checked = boxesConfig[option] ? " checked " : " ";

        return `<div class="checkbox"><label><input${checked}type="checkbox" class="option-checkbox" id="${option}" />${option}</label></div>`;
    });

    el.innerHTML = checkboxes.join("");
    el.onchange = function(event) {
        toggleOption(event.target.id, property);
    };

}

function drawSelectBoxes(boxesConfig, property) {
    const el = document.querySelector(`.${property}`);
    const select = document.createElement("select");
    const options = Object.keys(boxesConfig).filter(option => typeof boxesConfig[option] === "boolean").map(option => {
        const selected = boxesConfig[option] ? " selected " : " ";

        return `<option ${selected} value="${option}">${option}</option>`;
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
    document.getElementById("version").innerHTML = lib.getVersion();
}

function setupControls() {
    drawVersion();
    drawCheckboxes(config);
    drawCheckboxes(config.ecmaFeatures, "ecmaFeatures");
    drawSelectBoxes(config.ecmaVersion, "ecmaVersion");
    drawSelectBoxes(config.sourceType, "sourceType");
}

function showError(error) {
    console.error(error); // eslint-disable-line no-console
    results.classList.add("error");
    results.innerHTML = error.message;
}

function parseForever() {
    let ast;

    try {
        ast = lib.parse(editor.value, config);
        results.classList.remove("error");
        results.innerHTML = ast;
    } catch (error) {
        showError(error);
    }
    setTimeout(parseForever, 1000);
}

// set everything up
setupControls();
parseForever();
