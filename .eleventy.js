"use strict";

const fs = require("fs");
const { addFilters } = require("./_11ty/filters");

module.exports = function(eleventyConfig) {
    addFilters(eleventyConfig);

    eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("_posts/*.md").reverse());
    eleventyConfig.addPassthroughCopy("assets");

    // Handle 404s when developing locally.
    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
            // eslint-disable-next-line handle-callback-err
            ready(err, browserSync) {

                const page404 = fs.readFileSync("_site/404.html");

                browserSync.addMiddleware("*", (req, res) => {
                    res.write(page404);
                    res.end();
                });
            }
        },
        notify: true
    });

    return {
        dir: {
            includes: "_includes",
            layouts: "_layouts"
        }
    };
};
