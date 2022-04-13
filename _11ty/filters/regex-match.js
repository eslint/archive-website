"use strict";

module.exports = function regexMatch(text, regex) {
    return new RegExp(regex).test(text);
};
