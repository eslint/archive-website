---
layout: post
title: Updated Rule Policy
tags:
  - information
  - rules
---

# Updated Rule Policy

Rules have been at the core of ESLint since the very first release. We've gone through several development cycles of rules, first trying to replicate JSHint rules, creating ECMAScript 6 rules as best practices were being uncovered, shooting for feature parity with JSCS rules, and so on. Now, almost three years after ESLint was first created, we have over [200 rules](https://eslint.org/docs/rules/) in the core and continue to get new rule proposals every week.

When ESLint began, we wanted to have a good mix of rules that caught potential errors as well as rules about code style. We never intended to cover everything everyone would want, but rather, we wanted to cover the most common concerns facing JavaScript developers and leave the rest to custom rules. That's why ESLint has supported [custom rules](https://eslint.org/docs/developer-guide/working-with-rules.html) from the very first release: we knew that we could never provide the world with all of the rules that people would want, so the only real solution was to give everyone the ability to create their own rules.

After a lot of deliberation, we've decided that we will only be accepting new rules into ESLint when the team believes that not doing so would do more harm than good. For instance, we are committed to helping people transfer from other linters to ESLint, and so we will still consider adding rules that make the transition easier. Similarly, if a rule flags a potentially serious or difficult-to-identify error, then we will consider it as well. Otherwise, we'll be suggesting that people implement their own rules with [plugins](https://eslint.org/docs/developer-guide/working-with-plugins.html) from now on.

The community has written some excellent articles and tutorials about writing your own rules. Here are a few to get you started:

* [Project-specific Lint Rules with ESLint](https://gist.github.com/jareware/7179093)
* [Maintaining JavaScript Code Quality with ESLint](https://www.paypal-engineering.com/2014/12/12/maintaining-javascript-code-quality-with-eslint/)
* [ESLint - Customizable JavaScript Linting Tool](http://blog.thecodecampus.de/eslint-customizable-javascript-linting-tool-2/)
* [Creating Custom Rules for ESLint](https://insideops.wordpress.com/2015/12/08/creating-custom-rules-for-eslint/)

There are a lot of great things ahead for ESLint, and we hope you'll take this opportunity to learn more about writing and publishing your own rules.
