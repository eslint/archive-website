---
layout: post
title: Welcoming JSCS To ESLint
date: 2016-04-14 17:13:45
tags:
- jscs
- future
- plans
---

# Welcoming JSCS to ESLint

ESLint and [JSCS](http://jscs.info) started out at roughly the same time, just three weeks apart in 2013. Both teams had a similar idea: leverage the ecosystem of ESTree-compatible tools such as Esprima to create the next generation of static analysis tools for JavaScript. While ESLint's primary goal was to create a linter with pluggable rules, JSCS's primary goal was to codify style guides for easy verification and fixing. Both projects grew and became popular, and soon, we found ourselves playing catch up with each other for features.

For nearly three years now, both teams have been working on solving the same types of issues: how to share configurations, how to autofix some problems, and how to enable the respective ecosystems to grow and thrive. We've been doing a lot of the same work in parallel, and recently the teams met to talk about that. We all came to the conclusion that it would be better to be one team, working together on solving these problems, rather than continuing to compete with one another.

Below you'll find more details about how we'll move forward as a single team and our plans for both JSCS and ESLint.

## Welcoming the JSCS Team

I'm happy to announce that, effectively immediately, the JSCS team is now part of the ESLint team. I'd like to invite everyone to welcome Marat Dulin, Oleg Gaidarenko, Mike Sherov, Alexej Yaroshevich, and Henry Zhu, and we're looking forward to working with them all. All of the JSCS team members will be joining ESLint as committers (based on our [governance policy](https://eslint.org/docs/maintainer-guide/governance.html#committers)) for appreciation of their work on JSCS.

Joel Kemp has decided to focus on other work and won't be joining ESLint. I, and the rest of the team, would also like to thank Joel for his many contributions to JSCS over the years.

## JSCS 3.0.0

Today, [JSCS released version 3.0.0](https://medium.com/@markelog/jscs-end-of-the-line-bc9bf0b3fdb2#.k5yf1bry8), which will be the last major release of JSCS. This version has been rewritten to use a concrete syntax tree ([CST](https://github.com/cst/cst)) instead of an abstract syntax tree (AST). The concept of a CST has been floating around the JavaScript ecosystem for quite some time, and JSCS 3.0.0 represents the first tool to fully realize the use of a JavaScript CST in production. As such, we really need feedback from the JSCS community relating to this release as it's quite possible we'll use either the same or a similar approach in ESLint going forward.

If you're a current JSCS user, I strongly urge you to upgrade to 3.0.0 and report your experience. The JSCS team will continue to work on JSCS in the near-term, fixing bugs as they are reported.

## Making ESLint Work for JSCS Users

We recognize that there is a large and vibrant JSCS user base, and as such, the first goal of the combined ESLint/JSCS team is to make the transition to ESLint easy for JSCS users. To that end, our immediate-term plan includes the following tasks:

* Identifying rules that exist in JSCS but are missing in ESLint and creating as many of those rules as we can. ([#5856](https://github.com/eslint/eslint/issues/5856))
* Incorporating a way to convert `.jscsrc` files into `.eslintrc` files with the goal of having a single command to do this automatically. ([#5857](https://github.com/eslint/eslint/issues/5857))
* Creating ESLint shareable configs for the most popular JSCS presets. ([#5858](https://github.com/eslint/eslint/issues/5858))
* Expanding ESLint's autofixing capabilities to fix more problems and try, as much as is possible, to approach the level of autofixing available in JSCS 2.x.
* Write documentation to guide JSCS users through transitioning to ESLint. ([#5859](https://github.com/eslint/eslint/issues/5859))

Check out our milestone on the tasks above [here](https://github.com/eslint/eslint/milestones/JSCS%20Compatibility).

We expect this effort to take several months, and as such, we still encourage current JSCS users to upgrade to JSCS 3.0.0 and provide feedback to the team. We'll announce when all of the changes necessary to support JSCS users in ESLint are complete and will start encouraging JSCS users to switch to ESLint at that time.

## The Future is Bright

With the new combined ESLint/JSCS team, you can expect a lot more from ESLint in the future. We now have some of the brightest people in the world working on making ESLint the best possible tool for JavaScript syntax analysis. I'm personally very excited about ESLint's future and tackling some of the more difficult problems like making autofix possible for every rule and incorporating type information into our analysis. We can go a lot further, faster, when we're all working on the same tool.

- Nicholas
