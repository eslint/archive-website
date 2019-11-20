"use strict";

const syntaxHighlighting = require("./syntax-highlighting");

const plugins = {
    syntaxHighlighting
};

module.exports = function addPlugins(eleventyConfig) {
    for (const plugin of Object.values(plugins)) {
        eleventyConfig.addPlugin(plugin);
    }
};
