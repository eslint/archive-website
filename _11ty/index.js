"use strict";

const plugins = require("./plugins");
const filters = require("./filters");

function addPlugins(eleventyConfig) {
    for (const plugin of Object.values(plugins)) {
        eleventyConfig.addPlugin(plugin);
    }
}

function addFilters(eleventyConfig) {
    for (const [name, filter] of Object.entries(filters)) {
        eleventyConfig.addFilter(name, filter);
    }
}

module.exports = {
    addPlugins,
    addFilters
};
