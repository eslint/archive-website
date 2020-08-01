"use strict";

const PORT = process.env.DEV_PORT || 8080;

function calculateUrl() {
    if (process.env.NODE_ENV === "development") {
        return `localhost:${PORT}`;
    }

    /*
     * Netlify sets the following environment variables
     * https://www.netlify.com/docs/continuous-deployment/#environment-variables
     */
    return process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL;
}

module.exports = {
    title: "ESLint - Pluggable JavaScript linter",
    description: "A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript. Maintain your code quality with ease.",
    banner: {
        text: "<a href='https://code2040-2020.funraise.org/' style='color: #a486df'>Donate to Code2040</a>",
        foregroundColor: "#ffffff",
        backgroundColor: "#150b29"
    },
    url: calculateUrl(),
    links: {
        chat: "/chat",
        codeOfConduct: "/conduct",
        mailingList: "https://groups.google.com/group/eslint",
        github: "https://github.com/eslint/eslint",
        twitter: "https://twitter.com/geteslint"
    }
};
