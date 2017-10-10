---
layout: post
title: ESLint's New Rule Format
tags:
  - rules
  - development
---
# ESLint's New Rule Format

When ESLint began three years ago, it was a much smaller project with a much smaller user base. The project has grown a lot since that time and, in order to help the project scale, we've invested a lot of time into automating as many processes as possible. For instance, our release process is now completely automated, including deciding what the next version number should be based on the commits going into the release. When we looked over the processes that are still manual, there was one that jumped out as a big pain point: keeping rule documentation in sync. This wasn't a big problem when there were a dozen rules, but with over 200, this repeated process has become a big time commitment.

So, for the first time, we've decided to change the rule format for ESLint. The change is fairly small and we're hoping you'll agree that it makes a lot of sense. The overall design goal was allow for meta data to be stored directly on the rules themselves. Doing so allows us to have one source of truth for rule-related meta data and then generate documentation such as our rules index page and documentation pages for individual rules based off of that meta data. That means we'll no longer have to manually update multiple documentation pages whenever a rule becomes fixable or is added to `eslint:recommended`.

We went through a lot of design sessions to come up with a new rule format that would be easy for existing rule developers to work with -- making the new format familiar with as few changes as possible

## Format Comparison

To start, consider what rules have traditionally looked like in ESLint:

```js
// the rule creator function
module.exports = function(context) {
    // code
};

// the rule options schema
module.exports.schema = [];
```

The two key parts of this format are the rule creator function and the rule options schema. As might be obvious, we started without rule options schemas and added them later. That led to the someone awkward inclusion of the `schema` object on `module.exports`. We never really liked this setup because it seemed like the schema should be defined before the creator function, but we didn't have much of an option without changing the whole rule format (which we didn't want to do at that point).

The new rule format should look a bit similar:

```js
module.exports = {

    meta: {

        // special key used for doc-only information
        docs: {},

        // indicates if the rule is fixable
        fixable: "code",

        // the rule options schema
        schema: []
    },

    // the rule creator function
    create: function(context) {
        // code
    }
};
```

The rule creator function and the rule options schema are still present in this new format. The big difference is that an object is exported and the rule creator function is a method called `create()` on that object. The contents of `create()` are the same as the contents of the creator function in the old format -- you don't have to do anything differently, so you can just copy over all of your old code as-is.

The object also has a `meta` property that contains additional meta data for the rule, including the rule options schema. Additionally, there is a `docs` object that contains information used in our documentation generation and the `fixable` property, which is present only if a rule is fixable (knowing that a rule is fixable ahead of time allows us to optimize the autofixing process as well as call this out in documentation).

You can read more about the new format in [Working with Rules](https://eslint.org/docs/developer-guide/working-with-rules).

## Automatic Transformation

All of the ESLint core rules have now been converted over into the new format, and we recommend that plugin authors update their custom rules to the new format as well. We used a tool that is now available called `eslint-transforms` to automatically convert our old-style rules into the new format. You can install the tool from npm:

```
$ npm install -g eslint-transforms
```

You can then transform your rules like this:

```
$ eslint-transforms new-rule-format path/to/rules/ rule.js
```

You can pass in as many files or directories as necessary to transform. See the [repo](https://github.com/eslint/eslint-transforms) for more information.



