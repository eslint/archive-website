"use strict";

const plugins = require("./plugins");
const filters = require("./filters");
const transforms = require("./transforms");

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

function addTransforms(eleventyConfig) {
    for (const [name, transform] of Object.entries(transforms)) {
        eleventyConfig.addTransform(name, transform);
    }
}

module.exports = {
    addPlugins,
    addFilters,
    addTransforms
};
