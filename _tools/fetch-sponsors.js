/**
 * @fileoverview Script to fetch sponsor data from Open Collective and GitHub.
 * Call using:
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
const { graphql: githubGraphQL } = require("@octokit/graphql");

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

// filename to output sponsors to
const sponsorsFilename = "./_data/sponsors.json";

// simplified data structure
const tierSponsors = {
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
    backers: []
};

const { ESLINT_GITHUB_TOKEN } = process.env;

if (!ESLINT_GITHUB_TOKEN) {
    throw new Error("Missing ESLINT_GITHUB_TOKEN.");
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Returns the tier ID for a given donation amount.
 * @param {int} monthlyDonation The monthly donation in dollars.
 * @returns {string} The ID of the tier the donation belongs to.
 */
function getTierSlug(monthlyDonation) {
    if (monthlyDonation >= 2000) {
        return "platinum-sponsor";
    }

    if (monthlyDonation >= 1000) {
        return "gold-sponsor";
    }

    if (monthlyDonation >= 500) {
        return "silver-sponsor";
    }

    if (monthlyDonation >= 200) {
        return "bronze-sponsor";
    }

    return "backer";
}

/**
 * Fetch order data from Open Collective using the GraphQL API.
 * @returns {Array} An array of sponsors.
 */
async function fetchOpenCollectiveSponsors() {

    const endpoint = "https://api.opencollective.com/graphql/v2";

    const query = `{
        account(slug: "eslint") {
          orders(status: ACTIVE, filter: INCOMING) {
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

    const result = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
    });

    const payload = await result.json();

    return payload.data.account.orders.nodes.map(order => ({
        name: order.fromAccount.name,
        url: order.fromAccount.website,
        image: order.fromAccount.imageUrl,
        monthlyDonation: order.frequency === "YEARLY" ? Math.round(order.amount.value * 100 / 12) : order.amount.value * 100,
        totalDonations: order.totalDonations.value * 100,
        source: "opencollective",
        tier: order.tier ? order.tier.slug : null
    }));

}

/**
 * Fetches GitHub Sponsors data using the GraphQL API.
 * @returns {Array} An array of sponsors.
 */
async function fetchGitHubSponsors() {

    const { organization } = await githubGraphQL(`query {
        organization(login: "eslint") {
          sponsorshipsAsMaintainer (first: 100) {
            nodes {
              sponsor: sponsorEntity {
                ...on User {
                  name,
                  login,
                  avatarUrl,
                  url,
                  websiteUrl
                }
                ...on Organization {
                  name,
                  login,
                  avatarUrl,
                  url,
                  websiteUrl
                }
              },
              tier {
                monthlyPriceInDollars
              }
            }
          }
        }
      }`, {
        headers: {
            authorization: `token ${ESLINT_GITHUB_TOKEN}`
        }
    });

    // return an array in the same format as Open Collective
    return organization.sponsorshipsAsMaintainer.nodes.map(({ sponsor, tier }) => ({
        name: sponsor.name,
        image: sponsor.avatarUrl,
        url: sponsor.websiteUrl || sponsor.url,
        monthlyDonation: tier.monthlyPriceInDollars * 100,
        source: "github",
        tier: getTierSlug(tier.monthlyPriceInDollars)
    }));

}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

(async () => {

    const [openCollectiveSponsors, githubSponsors] = await Promise.all([
        fetchOpenCollectiveSponsors(),
        fetchGitHubSponsors()
    ]);

    const sponsors = openCollectiveSponsors.concat(githubSponsors);

    // process into a useful format
    for (const sponsor of sponsors) {

        switch (sponsor.tier) {
            case "platinum-sponsor":
                tierSponsors.platinum.push(sponsor);
                break;

            case "gold-sponsor":
                tierSponsors.gold.push(sponsor);
                break;

            case "silver-sponsor":
                tierSponsors.silver.push(sponsor);
                break;

            case "bronze-sponsor":
                tierSponsors.bronze.push(sponsor);
                break;

            default:
                tierSponsors.backers.push(sponsor);

        }
    }

    // sort order based on total donations
    for (const key of Object.keys(tierSponsors)) {
        tierSponsors[key].sort((a, b) => b.monthlyDonation - a.monthlyDonation);
    }

    fs.writeFileSync(sponsorsFilename, JSON.stringify(tierSponsors, null, "    "), { encoding: "utf8" });
})();
