"use strict";

const { AllHtmlEntities } = require("html-entities");

module.exports = function xmlEscape(text) {
    return new AllHtmlEntities().decode(text);
};
