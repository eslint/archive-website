"use strict";

const htmlparser2 = require("htmlparser2");

module.exports = function numberOfWords(templateContent) {
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
};
