"use strict";

const { XmlEntities } = require("html-entities");

module.exports = function xmlEscape(text) {
    return new XmlEntities().encode(text);
};
