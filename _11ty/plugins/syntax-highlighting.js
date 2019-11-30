"use strict";

const markdownIt = require("markdown-it");
const highlightJS = require("highlight.js");

module.exports = function syntaxHighlighting(eleventyConfig) {
    const md = markdownIt({

        // https://github.com/markdown-it/markdown-it#syntax-highlighting
        highlight(text, lang = null) {
            if (lang && highlightJS.getLanguage(lang)) {
                try {
                    return `<pre class="hljs highlight-${lang}"><code>${highlightJS.highlight(lang, text, true).value}</code></pre>`;
                } catch (err) {

                    // Default to escaping HTML if highlighting throws an error.
                }
            }

            return `<pre class="hljs highlight-${lang}"><code>${md.utils.escapeHtml(text)}</code></pre>`;
        },
        html: true
    });

    eleventyConfig.setLibrary("md", md);
};
