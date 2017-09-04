/* eslint-env commonjs */

"use strict";

module.exports = {
    range: false,
    loc: false,
    comments: false,
    attachComment: false,
    tokens: false,
    ecmaVersion: {
        3: false,
        5: false,
        6: true,
        7: false,
        8: false
    },
    sourceType: {
        script: false,
        module: true
    },
    ecmaFeatures: {
        jsx: true,
        globalReturn: true,
        impliedStrict: false,
        experimentalObjectRestSpread: true
    }
};
