const path = require("path");

module.exports = {
    mode: "production",
    entry: "./js/app/parser/index.js",
    output: {
        filename: "index.built.js",
        path: path.resolve("./js/app/parser")
    }
};
