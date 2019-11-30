/**
 * @fileoverview Tool to convert YAML files to JSON.
 * @author Kai Cataldo
 */

/* eslint-disable no-console */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const glob = require("glob-promise");
const yaml = require("js-yaml");
const fsPromises = fs.promises;

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

(async function() {
    const [, , globPath] = process.argv;

    if (!globPath) {
        console.trace("Must be called with a glob.");
        process.exit(1);
    }

    console.log(`Converting YAML files found with glob "${globPath}" to JSON.`);

    const files = await glob(globPath);

    if (!files.length) {
        console.trace(`No files found for glob ${globPath}.`);
        process.exit(1);
    }

    return Promise.all(files.map(async file => {
        const contents = await fsPromises.readFile(path.resolve(file), "utf8");
        const newFileName = file.replace(/.yml$/, ".json");
        const parsedContents = yaml.safeLoad(contents, { filename: file });

        await fsPromises.writeFile(newFileName, JSON.stringify(parsedContents));
        console.log(` - ${file} converted to ${newFileName}`);
    }));
}());
