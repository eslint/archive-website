/* eslint-env node */

const path = require("path");

module.exports = {
    entry: {
        demo: path.join(__dirname, "js/app/demo/index.js"),
        parser: ["babel-polyfill", path.join(__dirname, "js/app/parser/index.js")]
    },
    output: {
        path: path.join(__dirname, "js/dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loaders: ["babel-loader"],
                include: path.join(__dirname, "js/app"),
                exclude: /node_modules|js\/vendor/
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"],
        modules: [path.resolve(__dirname, "js"), "node_modules"],
    }
}
