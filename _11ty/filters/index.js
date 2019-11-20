"use strict";

const dateFormat = require("./date-format");
const numberOfWords = require("./number-of-words");

const filters = {
    dateFormat,
    numberOfWords
};

module.exports = function addFilters(eleventyConfig) {
    for (const [name, filter] of Object.entries(filters)) {
        eleventyConfig.addFilter(name, filter);
    }
};
