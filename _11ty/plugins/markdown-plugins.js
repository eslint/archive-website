"use strict";

const markdownIt = require("markdown-it");
const markdownItContainer = require("markdown-it-container");
const highlightJS = require("highlight.js");
const { slug } = require("github-slugger");

module.exports = function syntaxHighlighting(eleventyConfig) {

    let md = markdownIt({

        // https://github.com/markdown-it/markdown-it#syntax-highlighting
        highlight(text, lang = null) {
            if (lang && highlightJS.getLanguage(lang)) {
                try {
                    return `<pre class="hljs highlight-${lang}"><code>${highlightJS.highlight(lang, text, true).value}</code></pre>`;
                } catch {

                    // Default to escaping HTML if highlighting throws an error.
                }
            }

            return `<pre class="hljs highlight-${lang}"><code>${md.utils.escapeHtml(text)}</code></pre>`;
        },
        html: true
    });

    // Replace the default Markdown engine with a new one that creates ID in headings
    // See: https://github.com/eslint/website/issues/747
    md = md.use(require("markdown-it-anchor"), {
        slugify(text) {

            // need to replace all the characters GitHub replaces
            return slug(text.replace(/[<>()[\]{}]/gu, ""))

                // remove non-ASCII characters
                .replace(/[^\u{00}-\u{FF}]/gu, "");
        },
        uniqueSlugStartIndex: 1
    });

    // add markdown containers
    md = md
        .use(require("markdown-it-container"), "correct", {})
        .use(require("markdown-it-container"), "incorrect", {});

    eleventyConfig.setLibrary("md", md);
};
