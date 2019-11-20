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

function spawnChildProcess(command, args) {
    const processName = `${command} ${args.join(" ")}`;
    const options = {
        cwd: path.resolve(__dirname, ".."),
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
    spawnChildProcess("npm", ["run", "start:eleventy"]);
    spawnChildProcess("npm", ["run", "start:webpack"]);
    console.log(`Listening on port ${PORT}\n`);
});
