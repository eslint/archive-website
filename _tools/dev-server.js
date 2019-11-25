/**
 * @fileoverview Local development server that emulates our Netlify deployment environments.
 *     Watches for changes and rebuilds source files as they are edited.
 * @author Kai Cataldo
 */

/* eslint-disable no-console */

"use strict";

const path = require("path");
const fs = require("fs");
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

/*
 * Paths that contain `.` characters are not matched by `express.static()`
 * (e.g. "_posts/2019-09-29-eslint-v6.5.0-released.md"). This is essentially
 * the same behavior as
 * `app.use(express.static(path.join(__dirname, "../_site"), { extensions: ["html"] }));`
 * but with the correct behavior for the noted exception above.
 *
 * TODO: Figure out why this is so that we don't have to create this custom route handler
 * and can use `express.static()` directly instead.
 */
app.get("*", (req, res, next) => {
    const reqPath = path.join(__dirname, "../_site", req.url);

    if (fs.existsSync(`${reqPath}.html`)) {
        if (req.url.endsWith("/")) {
            return res.redirect(301, req.url.replace(/\/$/u, ""));
        }

        return res.sendFile(`${reqPath}.html`);
    }

    if (fs.existsSync(reqPath)) {
        let filePathStats = null;

        try {
            filePathStats = fs.statSync(reqPath);
        } catch (err) {
            console.error(err);
        }

        if (filePathStats && filePathStats.isDirectory()) {
            if (!req.url.endsWith("/")) {
                return res.redirect(301, `${req.url}/`);
            }

            return res.sendFile(path.join(reqPath, "index.html"));
        }

        return res.sendFile(reqPath);
    }

    return next();
});
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "../_site/404.html")));
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
