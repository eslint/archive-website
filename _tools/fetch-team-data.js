/**
 * @fileoverview Script to fetch team data from GitHub. Call using:
 *     node _tools/fetch-team-data.js
 * @author Nicholas C. Zakas
 */

/* eslint camelcase: [error, { properties: never }] */

"use strict";

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

const fs = require("fs");
const { Octokit } = require("@octokit/rest");

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

// filename to output to
const filename = "./_data/team.json";

// retrieve token from environment
const { ESLINT_GITHUB_TOKEN } = process.env;

// exit early if no token is available
if (!ESLINT_GITHUB_TOKEN) {
    throw new Error("Missing ESLINT_GITHUB_TOKEN.");
}

// Github slugs for teams
const TSC_TEAM_SLUG = "eslint-tsc";
const REVIEWERS_TEAM_SLUG = "eslint-reviewers";
const COMMITTERS_TEAM_SLUG = "eslint-team";
const ALUMNI_TEAM_SLUG = "eslint-alumni";

// lookup table mapping Github team IDs to JSON keys
const teamIds = {
    [TSC_TEAM_SLUG]: "tsc",
    [COMMITTERS_TEAM_SLUG]: "committers",
    [REVIEWERS_TEAM_SLUG]: "reviewers",
    [ALUMNI_TEAM_SLUG]: "alumni"
};

// final data structure
const team = {
    tsc: [],
    alumni: [],
    reviewers: [],
    committers: []
};

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

(async () => {
    const octokit = new Octokit({
        userAgent: "ESLint Website",
        auth: ESLINT_GITHUB_TOKEN
    });

    for (const teamId of [TSC_TEAM_SLUG, ALUMNI_TEAM_SLUG, COMMITTERS_TEAM_SLUG, REVIEWERS_TEAM_SLUG]) {
        const { data: result } = await octokit.teams.listMembersInOrg({
            org: "eslint",
            team_slug: teamId,
            per_page: 100
        });

        // this user only has login, need to fetch the full profile for useful data
        for (const user of result) {
            const { data: profile } = await octokit.users.getByUsername({ username: user.login });

            team[teamIds[teamId]].push({
                username: user.login,
                name: profile.name,
                website: profile.blog,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
                twitter_username: profile.twitter_username,
                github_username: user.login,
                location: profile.location
            });
        }

    }

    // filter out TSC members and reviewers from committers list
    team.committers = team.committers.filter(user => !team.tsc.find(tscmember => tscmember.username === user.username) &&
            !team.reviewers.find(tscmember => tscmember.username === user.username));

    fs.writeFileSync(filename, JSON.stringify(team, null, "    "), { encoding: "utf8" });
})();
