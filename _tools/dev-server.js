/**
 * @fileoverview Local development server that emulates our Netlify deployment environments.
 *     Watches for changes and rebuilds source files as they are edited.
 * @author Kai Cataldo
 */

/* eslint-disable no-console */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const express = require("express");
const morgan = require("morgan");
const chokidar = require("chokidar");

const fsPromises = fs.promises;

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, "..");

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Converts a stream to string and formats the string.
 * @param {stream} data The stream to format.
 * @returns {string} The formatted stream data.
 */
function formatStreamData(data) {
    return data.toString().replace(/\n$/u, "");
}

/**
 * Removes a trailing slash from a url.
 * @param {string} url The url to format.
 * @returns {string} The formatted url.
 */
function removeTrailingSlash(url) {
    return url.replace(/\/$/u, "");
}

/**
 * Spawns a child process and logs output to the parent
 *     process's stdout/stderr.
 * @param {string} command The command to run.
 * @param {string[]} args The arguments to run.
 * @returns {void}
 */
function spawnChildProcess(command, args) {
    const processName = `${command} ${args.join(" ")}`;
    const options = {
        cwd: ROOT_DIR,
        shell: true
    };
    const childProcess = spawn(command, args, options);

    childProcess.on("error", err => {
        console.error(`Error while spawning ${processName}: ${err.message}\n`);
        throw err;
    });
    childProcess.stdout.on("data", data => console.log(formatStreamData(data)));
    childProcess.stderr.on("data", data => console.error(formatStreamData(data)));
}

/**
 * Checks if a given file path exists.
 * @param {string} filePath The path to check.
 * @returns {Promise<boolean>} A promise that resolves with true if the
 *     file path exists and false if it doesn't.
 */
async function filePathExists(filePath) {
    try {
        await fsPromises.access(filePath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

const app = express();

// HTTP Logging
app.use(morgan("tiny"));

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
app.get("*", async(req, res, next) => {
    const reqPath = path.join(__dirname, "../_site", removeTrailingSlash(req.url));

    if (await filePathExists(reqPath)) {

        // Handle directories.
        if (!path.extname(reqPath).length) {
            let filePathStats = null;

            try {
                filePathStats = await fsPromises.stat(reqPath);
            } catch (err) {
                console.error(err);
            }

            if (filePathStats && filePathStats.isDirectory()) {
                if (!req.url.endsWith("/")) {
                    return res.redirect(301, `${req.url}/`);
                }

                return res.sendFile(path.join(reqPath, "index.html"));
            }
        }

        // Handle all other assets.
        return res.sendFile(reqPath);
    }

    // Serve "pretty" urls that do not have the `.html` extension.
    if (await filePathExists(`${reqPath}.html`)) {
        if (req.url.endsWith("/")) {
            return res.redirect(301, removeTrailingSlash(req.url));
        }

        return res.sendFile(`${reqPath}.html`);
    }

    // File could not be found.
    return next();
});

// 404 Handler
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
