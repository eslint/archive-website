/**
 * @fileoverview Local development server that emulates our Netlify deployment environments.
 *     Watches for changes and rebuilds source files as they are edited.
 * @author Kai Cataldo
 */

/* eslint-disable no-console */

"use strict";

const path = require("path");
const { spawn } = require("child_process");
const express = require("express");
const chokidar = require("chokidar");

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, "..");
const app = express();

function formatStreamData(data) {
    return data.toString().replace(/\n$/u, "");
}

function spawnChildProcess(command, args) {
    const processName = `${command} ${args.join(" ")}`;
    const options = {
        cwd: ROOT_DIR,
        shell: true
    };
    const childProcess = spawn(command, args, options);

    childProcess
        .on("error", err => {
            console.error(`Error while spawning ${processName}: ${err.message}\n`);
            throw err;
        })
        .on("exit", code => console.log(`${processName} has exited with code ${code}.\n`));
    childProcess.stdout.on("data", data => console.log(formatStreamData(data)));
    childProcess.stderr.on("data", data => console.error(formatStreamData(data)));
}

app.use(express.static(path.resolve(__dirname, "../_site"), { extensions: ["html"] }));
app.use((req, res) => res.status(404).sendFile(path.resolve(__dirname, "../_site/404.html")));
app.listen(PORT, () => {

    // Less dosen't have a maintained watcher.
    chokidar.watch(path.resolve(ROOT_DIR, "src/styles/**/*.less"))
        .on("change", filePath => {
            console.log(`\n${filePath} changed. Recompiling styles.`);
            spawnChildProcess("npm", ["run", "build:less"]);
        })
        .on("ready", () => spawnChildProcess("npm", ["run", "build:less"]));

    spawnChildProcess("npm", ["run", "start:eleventy"]);
    spawnChildProcess("npm", ["run", "start:webpack"]);
    console.log(`Local version of eslint.org can be accessed at http://localhost:${PORT}.\n`);
});
