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
const fetch = require("node-fetch"); // eslint-disable-line node/no-unpublished-require

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

const graphqlEndpoint = "https://api.opencollective.com/graphql/v2";

const graphqlQuery = `{
  account(slug: "eslint") {
    orders(status: ACTIVE) {
      totalCount
      nodes {
        fromAccount {
          name
          website
          imageUrl
        }
        amount {
          value
        }
        tier {
          slug
        }
        frequency
        totalDonations {
          value
        }
      }
    }
  }
}`;

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

(async() => {

    // fetch the data
    const result = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: graphqlQuery })
    });
    const orders = await result.json().then(res => res.data.account.orders.nodes);

    // process into a useful format
    for (const order of orders) {

        const sponsor = {
            name: order.fromAccount.name,
            url: order.fromAccount.website,
            image: order.fromAccount.imageUrl,
            monthlyDonation: order.frequency === "year" ? Math.round(order.amount.value * 100 / 12) : order.amount.value * 100,
            totalDonations: order.totalDonations.value * 100
        };

        const tierSlug = order.tier ? order.tier.slug : null;

        switch (tierSlug) {
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
