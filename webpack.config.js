"use strict";

const path = require("path");
const webpack = require("webpack");
const CleanCSSPlugin = require("less-plugin-clean-css");

/** @type {webpack.Configuration} */
module.exports = {
    entry: {
        demo: path.resolve(__dirname, "src/js/demo/index.js"),
        main: path.resolve(__dirname, "src/js/main/index.js")
    },
    output: {
        path: path.resolve(__dirname, "_site/assets/js"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/u,
                loader: "babel-loader",
                include: path.resolve(__dirname, "src/js"),
                exclude: [
                    path.resolve(__dirname, "node_modules"),
                    path.resolve(__dirname, "src/js/demo/node_modules/lodash")
                ],
                options: {
                    configFile: path.resolve(__dirname, ".babelrc")
                }
            },
            {
                test: /\.less$/u,
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
                            lessOptions: {
                                plugins: [
                                    new CleanCSSPlugin()
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser"
        })
    ],
    resolve: {
        extensions: [".js", ".jsx"],
        fallback: {
            path: "path-browserify"
        },
        mainFields: ["browser", "main", "module"]
    },
    stats: "errors-only"
};
