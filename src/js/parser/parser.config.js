export default {
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
        8: false,
        9: false,
        10: false
    },
    sourceType: {
        script: false,
        module: true
    },
    ecmaFeatures: {
        jsx: true,
        globalReturn: true,
        impliedStrict: false
    }
};
