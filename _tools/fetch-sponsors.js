/**
 * @fileoverview Script to fetch sponsor data from Open Collective. Call using:
 *     node _tools/fetch-sponsors.js
 * @author Nicholas C. Zakas
 */

/* eslint camelcase: [error, { properties: never }] */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const fs = require("fs");
const fetch = require("node-fetch");

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

// filename to output to
const filename = "./_data/sponsors.json";

// simplified data structure
const sponsors = {
    gold: [],
    silver: [],
    bronze: [],
    backers: []
};

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

(async() => {

    // fetch the data
    const result = await fetch("https://opencollective.com/api/groups/eslint/backers");
    const backers = await result.json();

    // process into a useful format
    for (const backer of backers) {
        const sponsor = {
            name: backer.name,
            url: backer.website,
            image: backer.avatar,
            totalDonations: backer.totalDonations
        };

        switch (backer.tier) {
            case "gold-sponsor":
                sponsors.gold.push(sponsor);
                break;
                
            case "silver-sponsor":
                sponsors.silver.push(sponsor);
                break;

            // Open Collective bug, need to check for both
            case "sponsor":
            case "bronze-sponsor":
                sponsors.bronze.push(sponsor);
                break;

            default:
                sponsors.backers.push(sponsor);

        }
    }

    fs.writeFileSync(filename, JSON.stringify(sponsors, null, "    "), { encoding: "utf8" });
})();
