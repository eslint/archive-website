---
title: "End-of-Life for Built-in JSDoc Support in ESLint"
tags:
  - eol
  - jsdoc
  - doctrine
---

Over the past few years, the ESLint project has grown in size and scope. What originally consisted of a single executable package has grown into a project with multiple packages including several parsers and other utilities. Although the project has grown, the size of the team has not, and as such we’ve had to make some tough decisions about how to continue maintaining the ESLint project as a whole using an all-volunteer team.

As part of a recent review, we've decided to end-of-life the built-in support for JSDoc in the ESLint project. This post contains the details of that decision and what happens next.

## Current JSDoc Support in ESLint

JSDoc support in ESLint currently consists of:

* Maintaining the [Doctrine](https://github.com/eslint/doctrine) JSDoc comment parser
* The [`require-jsdoc`](https://eslint.org/docs/rules/require-jsdoc) rule
* The [`valid-jsdoc`](https://eslint.org/docs/rules/valid-jsdoc) rule
* The [`SourceCode#getJSDocComment()`](https://eslint.org/docs/developer-guide/working-with-rules#contextgetsourcecode) method

To support JSDoc in ESLint, we had been spending an outsized amount of time maintaining Doctrine and the `valid-jsdoc rule` as compared to the effort required to maintain the rest of the project. Those two parts, in addition to the `require-jsdoc` rule and `SourceCode#getJSDocComment()` are being end-of-lifed beginning today.

## What End-of-Life Means

End-of-life for core JSDoc support means you will see the following happening in the next several weeks:

* Doctrine will no longer be updated. Version 3.0.0, published two weeks ago, will be the last major version release. We may need to do a couple of small updates before stopping all maintenance, but we will no longer be adding features or fixing bugs. We believe Doctrine is in a solid and reliable state and would make a good base if anyone wants to fork it to begin a new project.
* The `require-jsdoc` and `valid-jsdoc` rules will be [deprecated](https://eslint.org/docs/user-guide/rule-deprecation#rule-deprecation). These two rules will remain in ESLint but we will no longer add new features or fix bugs for them. These rules may be removed in a future major release of ESLint.
* The `SourceCode#getJSDocComment()` method will be deprecated. We won’t be making changes related to this method and will remove it in a future major release of ESLint.

Be sure to check the release announcements for when these changes take effect.

## Suggested Replacement

If you would like to continue checking JSDoc comments using ESLint, we suggest using the community-supported [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc) plugin. This plugin contains several rules that are more specific than the core ESLint rules being deprecated and may actually be a better fit for most projects.

## Frequently Asked Questions

### Why aren’t you trying to find new maintainers for Doctrine?

There are a couple of reasons why we decided not to find new maintainers for Doctrine.

First, while the package is widely-used, there has been very few contributions from those outside of the team. Whereas some packages get a lot of attention from outside contributors and it may be easy to find a new maintainer, that wasn’t the case with Doctrine.

Second, because Doctrine is a part of the JS Foundation, taking over its maintenance means being involved with the Foundation. In the event that a single maintainer decided to take this on, that might be too much overhead.

With nearly 7 million weekly downloads on npm, it seemed like the best option for existing users was to end-of-life the Doctrine project rather than try to find a new maintainer. We believe a better option for an interested new maintainer would be to fork Doctrine and start fresh rather than try to take over the way Doctrine had already been maintained.

## Why are you going to keep the JSDoc rules and not maintain them?

We are keeping the existing JSDoc rules to give users plenty of time to transition to using `eslint-plugin-jsdoc`. We try to minimize the number of times we ask our users to update their config files, and by deprecated the existing JSDoc rules while keeping them available, we are allowing everyone to make a gradual transition while also freeing up ESLint team resources to work on other parts of the project.

## What if I have other questions about this?

Please reach out to us through the [mailing list](https://groups.google.com/group/eslint).
