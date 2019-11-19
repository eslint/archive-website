"use strict";

const moment = require("moment");
const htmlparser2 = require("htmlparser2");

const filters = {
    dateFormat(date, format) {

        /*
        * Convert to UTCString to avoid off by one error.
        * https://www.11ty.io/docs/dates/#dates-off-by-one-day
        */
        return moment(date.toUTCString()).format(format);
    },
    numberOfWords(templateContent) {
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
    }
};

module.exports = {
    addFilters(eleventyConfig) {
        for (const [name, filter] of Object.entries(filters)) {
            eleventyConfig.addFilter(name, filter);
        }
    }
};
