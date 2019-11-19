"use strict";

module.exports = {
    title: "ESLint - Pluggable JavaScript linter",
    description: "A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. Maintain your code quality with ease.",

    /*
     * Netlify sets the following environment variables
     * https://www.netlify.com/docs/continuous-deployment/#environment-variables
     */
    url: (process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL) || ""
};
