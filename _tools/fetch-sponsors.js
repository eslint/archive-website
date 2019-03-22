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
const moment = require("moment");

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

        // anyone who is in the list has donated at least one month
        let months = 1;
        
        // if the donation dates are different, it's at least two months
        if (backer.firstDonation !== backer.lastDonation) {
            const firstDonationDate = moment(backer.firstDonation);
            const lastDonationDate = moment(backer.lastDonation);

            months += 1;
            months += lastDonationDate.diff(firstDonationDate, "months");
        }

        const sponsor = {
            name: backer.name,
            url: backer.website,
            image: backer.avatar,
            // "sponsor" means one-time donation
            monthlyDonation: backer.tier !== "sponsor" ? Math.round(backer.totalDonations / months) : 0, 
            totalDonations: backer.totalDonations
        };

        switch (backer.tier) {
            case "gold-sponsor":
                sponsors.gold.push(sponsor);
                break;
                
            case "silver-sponsor":
                sponsors.silver.push(sponsor);
                break;

            case "bronze-sponsor":
                sponsors.bronze.push(sponsor);
                break;

            default:
                sponsors.backers.push(sponsor);

        }
    }

    // sort order based on total donations
    for (const key of Object.keys(sponsors)) {
        sponsors[key].sort((a, b) => b.monthlyDonation - a.monthlyDonation);
    }

    fs.writeFileSync(filename, JSON.stringify(sponsors, null, "    "), { encoding: "utf8" });
})();
