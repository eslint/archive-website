"use strict";

const path = require("path");
const CleanCSSPlugin = require("less-plugin-clean-css");

module.exports = {
    entry: {
        demo: path.join(__dirname, "src/js/demo/index.js"),
        parser: path.join(__dirname, "src/js/parser/index.js"),
        main: path.join(__dirname, "src/js/main/index.js")
    },
    output: {
        path: path.join(__dirname, "_site/assets/js"),
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
