"use strict";

const fs = require("fs");

module.exports = function(eleventyConfig) {
    eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("_posts/*.md"));
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
            // eslint-disable-next-line handle-callback-err
            ready(err, browserSync) {

                // Handle 404s when developing locally.
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
