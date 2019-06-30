"use strict";

module.exports = {
    root: true,
    extends: ["eslint"],
    parserOptions: {
        ecmaVersion: 2019
    },
    overrides: [
        {
            files: ["js/app/{demo,parser}/**/*.{js,jsx}"],
            plugins: ["react", "jsx-a11y"],
            extends: ["plugin:react/recommended", "plugin:jsx-a11y/recommended"],
            parserOptions: {
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            },
            settings: {
                react: {
                    version: "15.0.1"
                }
            },
            rules: {

                // Disable rules that the codebase doesn't currently follow.
                // It might be a good idea to enable these in the future.
                "jsx-a11y/no-onchange": "off",
                "react/prop-types": "off",
                "require-jsdoc": "off"
            }
        },
        {
            files: ["js/app/image-lazy-loader.js"],
            parserOptions: {
                ecmaVersion: 5,
                sourceType: "script"
            },
            rules: {
                "require-jsdoc": "off"
            }
        },
        {
            files: ["js/app/**/*.{js,jsx}"],
            env: {
                browser: true,
                node: false
            },
            rules: {

                // Disable rules that assume an ES6 environment.
                // This is not a complete list. More rules should be added as problems are encountered.
                "no-var": "off",
                "object-shorthand": "off",
                "prefer-arrow-callback": "off",
                "prefer-rest-params": "off",
                "prefer-template": "off",

                // Disable eslint-plugin-node rules from eslint-config-eslint
                "no-process-exit": "off",
                "node/no-deprecated-api": "off",
                "node/no-extraneous-require": "off",
                "node/no-missing-require": "off",
                "node/no-unpublished-bin": "off",
                "node/no-unpublished-require": "off",
                "node/no-unsupported-features/es-builtins": "off",
                "node/no-unsupported-features/es-syntax": "off",
                "node/no-unsupported-features/node-builtins": "off",
                "node/process-exit-as-throw": "off",
                "node/shebang": "off",
                "node/no-extraneous-import": "off",
                "node/no-missing-import": "off",
                "node/no-unpublished-import": "off"
            }
        }
    ]
};
