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

    // Replace the default Markdown engine with a new one that creates ID in headings
    // See: https://github.com/eslint/website/issues/747
    const markdownIt = require("markdown-it");
    const markdownItAnchor = require("markdown-it-anchor");
    const markdownLib = markdownIt({ html: true }).use(markdownItAnchor);

    eleventyConfig.setLibrary("md", markdownLib);

    return {
        dir: {
            includes: "_includes",
            layouts: "_layouts"
        }
    };
};
