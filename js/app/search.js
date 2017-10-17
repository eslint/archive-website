/* global algoliasearch, autocomplete */

"use strict";

(function() {
    var client = algoliasearch("XWXG7MEBSB", "653e00f423bee91f9863571eed16f2f5");
    var suggestionTemplate = window.Hogan.compile(document.querySelector("#suggestion-item-template").innerHTML);
    var searchInputSelector = "#eslint-search-input";
    var $searchInput = document.querySelector(searchInputSelector);
    var suggestionFooter = "<a class=\"suggestion-footer\" href=\"https://www.algolia.com/?utm_source=eslint\" target=\"_blank\">powered by <span class=\"suggestion-footer-logo\">Algolia</span></a>";

    // Reorder hits to group them by section
    function formatHits(hits) {

    // Flatten all values into one array, marking the first element with
    // `flagName`
        function flattenObject(o, flagName) {
            var values = _.map(_.values(o), function(value) {
                value[0][flagName] = true;
                return value;
            });

            return _.flatten(values);
        }

        // Group hits by category / subcategory
        var groupedHits = _.groupBy(hits, "category");

        _.each(groupedHits, function(list, category) {
            var groupedHitsBySubCategory = _.groupBy(list, "subcategory");
            var flattenedHits = flattenObject(groupedHitsBySubCategory, "isSubcategoryHeader");

            groupedHits[category] = flattenedHits;
        });
        groupedHits = flattenObject(groupedHits, "isCategoryHeader");

        // Translate hits into smaller objects to be send to the template
        return _.map(groupedHits, function(hit) {
            return {
                isCategoryHeader: hit.isCategoryHeader,
                isSubcategoryHeader: hit.isSubcategoryHeader,
                /* eslint-disable no-underscore-dangle */
                category: hit._highlightResult.category ? hit._highlightResult.category.value : hit.category,
                subcategory: hit._highlightResult.subcategory ? hit._highlightResult.subcategory.value : hit.category,
                title: hit._highlightResult.display_title ? hit._highlightResult.display_title.value : hit.display_title,
                text: hit._snippetResult ? hit._snippetResult.text.value : hit.text,
                /* eslint-enable no-underscore-dangle */
                url: hit.url
            };
        });
    }

    // Calls the Algolia API to get results matching the query
    function autocompleteSource(query, callback) {
        client.search([{
            indexName: "eslint",
            query: query,
            params: {
                hitsPerPage: 5
            }
        }], function(err, data) {
            if (err) {
                console.error(err); // eslint-disable-line no-console
            }
            callback(formatHits(data.results[0].hits));
        });
    }

    var search = autocomplete(searchInputSelector, {
        hint: false
    }, [
        {
            source: autocompleteSource,
            displayKey: function() {
                return $searchInput.value;
            },
            templates: {
                suggestion: function(suggestion) {
                    return suggestionTemplate.render(suggestion);
                },
                footer: function() {
                    return suggestionFooter;
                }
            }
        }
    ]).on("autocomplete:selected", function(event, suggestion) {
        search.autocomplete.setVal("");
        window.location.href = suggestion.url;
    });

    // Init autocomplete
    var htmlClassList = document.documentElement.classList;

    htmlClassList.remove("no-js");
    htmlClassList.add("js");

    // Toggle and focus the search bar when clicking on the magnifying glass on
    // small devices. This is achieved through a label and corresponding
    // checkbox.
    // This could have been done in complete HTML except that it does not work
    // on iOS (focus can only be triggered from user interaction), so we need to
    // replicate the behavior using JavaScript.
    var $toggleCheckbox = document.querySelector("#eslint-toggle-search");
    var $toggleLabels = document.querySelector(".eslint-toggle-search-open");

    $toggleLabels.addEventListener("click", function(e) {
        $toggleCheckbox.click();
        $searchInput.focus();
        e.preventDefault();
    });
})();

