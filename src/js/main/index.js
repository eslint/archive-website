import "core-js/stable";
import "regenerator-runtime/runtime";

/*
 * bootstrap.native automatically initializes components.
 * Elements that are not on the page when this script loads
 * will require manual initialization.
 */
import "bootstrap.native";
import docsearch from "docsearch.js";
import AnchorJS from "anchor-js";
import ImageObserver from "./image-lazy-loader";

const htmlClassList = document.documentElement.classList;

htmlClassList.remove("no-js");
htmlClassList.add("js");

// The menu dropdown toggles are also links
document.querySelectorAll("[data-toggle=\"dropdown\"]")
    .forEach(el => el.addEventListener("click", e => e.preventDefault()));

// Initialize DocSearch
docsearch({
    apiKey: "891b0e977d96c762a3821e0c00172ac9",
    indexName: "eslint",
    inputSelector: "#eslint-search-input",
    algoliaOptions: { facetFilters: [["tags:docs", "tags:blog"]] },
    debug: false // Set debug to true if you want to inspect the dropdown
});

document.addEventListener("DOMContentLoaded", () => {

    // Initialize deep anchor links for headings
    const anchors = new AnchorJS();

    anchors.add(".doc h2, .doc h3, .doc h4, .blog h2, .blog h3, .blog h4");

    // Initialize lazy loading images
    ImageObserver.createObserver();
    window.addEventListener("load", () => {
        ImageObserver.observe();
    }, false);
});

/* eslint-disable */
// Initialize Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
/* eslint-enable */

window.ga("create", "UA-60915033-1", "eslint.org");
window.ga("send", "pageview");
document.querySelectorAll(".sponsor-link").forEach(
    el => el.addEventListener("click",
        () => window.ga("send", "event", "Logos", "click", el.title || ""))
);
