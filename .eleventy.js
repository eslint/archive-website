"use strict";

const fs = require("fs");
const { addPlugins, addFilters, addTransforms } = require("./_11ty");

module.exports = function(eleventyConfig) {
    addPlugins(eleventyConfig);
    addFilters(eleventyConfig);
    addTransforms(eleventyConfig);

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
