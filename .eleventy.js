"use strict";

const { addPlugins, addFilters, addTransforms } = require("./_11ty");
const yaml = require("js-yaml");

module.exports = function(eleventyConfig) {
    addPlugins(eleventyConfig);
    addFilters(eleventyConfig);
    addTransforms(eleventyConfig);

    // Add YAML files as data sources
    eleventyConfig.addDataExtension("yml", contents => yaml.safeLoad(contents));

    // Add collection of blog posts.
    eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("_posts/*.md").reverse());

    // Copy over static assets.
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy({ "public/*": "." });
    eleventyConfig.addPassthroughCopy("docs/**/*.svg");

    return {
        dir: {
            includes: "_includes",
            layouts: "_layouts"
        }
    };
};
