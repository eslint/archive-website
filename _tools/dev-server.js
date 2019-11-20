/* eslint-disable no-console */

"use strict";

const path = require("path");
const { spawn } = require("child_process");
const express = require("express");

const PORT = 8080;
const app = express();

function formatStreamData(data) {
    return data.toString().replace(/\n$/u, "");
}

app.use(express.static(path.resolve(__dirname, "../_site"), { extensions: ["html"] }));
app.use((req, res) => res.status(404).sendFile(path.resolve(__dirname, "../_site/404.html")));
app.listen(PORT, () => {
    const eleventyWatch = spawn("npm", ["run", "start:eleventy"], {
        cwd: path.resolve(__dirname, ".."),
        shell: true
    });

    eleventyWatch
        .on("error", err => {
            console.error(`Failed to start eleventy --watch with error: ${err.message}\n`);
            throw err;
        })
        .on("exit", code => console.log(`eleventy --watch has exited with code ${code}.\n`));
    eleventyWatch.stdout.on("data", data => console.log(formatStreamData(data)));
    eleventyWatch.stderr.on("data", data => console.error(formatStreamData(data)));
    console.log(`Listening on port ${PORT}\n`);
});
