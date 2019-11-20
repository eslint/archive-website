"use strict";

const htmlmin = require("html-minifier");

module.exports = function minifyHtml(content, outputPath) {
    if ([".html", ".xml"].some(ext => outputPath.endsWith(ext))) {
        return htmlmin.minify(content, {
            useShortDoctype: true,
            removeComments: true,
            collapseWhitespace: true
        });
    }

    return content;
};
