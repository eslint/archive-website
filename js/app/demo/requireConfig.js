/* global requirejs */

"use strict";

requirejs.config({
    paths: {
        react: "https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react.min",
        reactDom: "https://cdnjs.cloudflare.com/ajax/libs/react/15.0.1/react-dom.min",
        text: "../../vendor/text",
        JSXTransformer: "../../vendor/JSXTransformer",
        jsx: "../../vendor/jsx",
        eslint: "../eslint"
    },
    packages: [
        {
            name: "orion",
            location: "../../vendor/orion",
            main: "../../vendor/orion/editor/built-editor-amd.min"
        }
    ],
    jsx: {
        fileExtension: ".jsx"
    },
    waitSeconds: 15
});

requirejs(["main"]);
