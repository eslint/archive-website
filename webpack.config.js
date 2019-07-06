"use strict";

const path = require("path");
const CleanCSSPlugin = require("less-plugin-clean-css"); // eslint-disable-line node/no-unpublished-require

module.exports = {
    entry: {
        demo: ["core-js/stable", "regenerator-runtime/runtime", path.join(__dirname, "src/js/demo/index.js")],
        parser: ["core-js/stable", "regenerator-runtime/runtime", path.join(__dirname, "src/js/parser/index.js")]
    },
    output: {
        path: path.join(__dirname, "assets/build/js"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loaders: ["babel-loader"],
                include: path.join(__dirname, "src/js"),
                exclude: /node_modules|src\/js\/vendor/
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "less-loader",
                        options: {
                            plugins: [
                                new CleanCSSPlugin()
                            ]
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    }
};
