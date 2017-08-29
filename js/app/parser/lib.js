/* eslint-env commonjs */

"use strict";

// requires
var espree = require("espree");

exports.parse = function(code, config) {
    var ast = espree.parse(code, config); // throws...

    return JSON.stringify(ast, null, "  ");
};

exports.getVersion = function() {
    return espree.version;
};
