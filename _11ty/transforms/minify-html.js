"use strict";

const htmlmin = require("html-minifier");

module.exports = function minifyHtml(content, outputPath) {
    if (outputPath.endsWith(".html")) {
        return htmlmin.minify(content, {
            useShortDoctype: true,
            removeComments: true,
            collapseWhitespace: true
        });
    }

    return content;
};
