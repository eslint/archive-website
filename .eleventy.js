"use strict";

const fs = require("fs");
const moment = require("moment");
const htmlparser2 = require("htmlparser2");

module.exports = function(eleventyConfig) {

    // https://www.11ty.io/docs/dates/#dates-off-by-one-day
    eleventyConfig.addFilter("date", (date, format) => moment(date.toUTCString()).format(format));
    eleventyConfig.addFilter("numberOfWords", templateContent => {
        let htmlTextContent = "";
        let isInCodeBlock = false;

        const parser = new htmlparser2.Parser(
            {
                onopentag(tagName) {
                    if (tagName !== "pre") {
                        return;
                    }
                    isInCodeBlock = true;
                },
                ontext(text) {

                    // Ignore code examples and filter out punctuation.
                    if (isInCodeBlock || !/[\w\d]/.test(text)) {
                        return;
                    }
                    htmlTextContent += ` ${text.trim()}`;
                },
                onclosetag(tagName) {
                    if (tagName !== "pre") {
                        return;
                    }
                    isInCodeBlock = false;
                }
            },
            { decodeEntities: true }
        );

        parser.parseComplete(templateContent);
        return htmlTextContent.trim().split(/\s+/).length;
    });
    eleventyConfig.addCollection("posts", collection => collection.getFilteredByGlob("_posts/*.md").reverse());
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
