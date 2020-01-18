"use strict";

module.exports = {
    root: true,
    extends: ["eslint"],
    parserOptions: {
        ecmaVersion: 2019
    },
    rules: {

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
        "node/no-unpublished-import": "off",

        // Disable rules that the codebase doesn't currently follow.
        "jsdoc/require-jsdoc": "off"
    },
    overrides: [
        {
            files: ["src/js/**/*.{js,jsx}"],
            plugins: ["react", "jsx-a11y"],
            extends: ["plugin:react/recommended", "plugin:jsx-a11y/recommended"],
            parserOptions: {
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true
                }
            },
            env: {
                browser: true,
                node: false
            },
            settings: {
                react: {
                    version: "16.8.6"
                }
            },
            rules: {
                "react/jsx-no-target-blank": "error",

                // Disable rules that the codebase doesn't currently follow.
                // It might be a good idea to enable these in the future.
                "jsx-a11y/no-onchange": "off",
                "react/prop-types": "off"
            }
        }
    ]
};
