---
layout: post
title: Changes to our rules policies
teaser: "We've recently made some changes to our rule policies that we're happy to share with you."
tags:
  - rules
  - policies
authors:
  - nzakas
  - btmills
categories:
  - Policy Updates
---

When ESLint was first created, the idea was to have a small set of 20-30 core rules that could get everyone started, and then to let the community build out its own rules to fill in any remaining gaps. We did, however, continue implementing core rules as it seemed helpful to the point where today there are 280 core rules. At any given time, more than half of open issues and pull requests are related to rules that take up a significant portion of the team's time.

ESLint now benefits from a thriving ecosystem of rule-focused plugins like `eslint-plugin-node`, `eslint-plugin-import`, `eslint-plugin-react`, and many others. Tools like [astexplorer.net](https://astexplorer.net) and numerous tutorials have made it easier than ever for developers to write their own rules. The core team no longer needs to build up a critical mass of basic rules, so we can prioritize our time on long-awaited core features like parallel linting that will benefit the whole community. We're making some changes to how we prioritize changes to built-in rules, but as always, if a rule isn't quite right for your situation, you're encouraged to modify it as a custom rule for your own project and share it with the rest of the community. 

## What are the changes?

Going forward, we're making the following changes to how we deal with rule issues and pull requests:

* **New rules are limited** - we will only accept new rules when they relate to new ECMAScript features that reached stage 4 in the preceding 12 months. The community relies on ESLint to help teach them the correct way to use new language features, and we want to continue doing that. We won't be accepting new rules that are suggestions or preferences unrelated to new ECMAScript features.
* **No new rules that only disallow syntax** - we already have [`no-restricted-syntax`](https://eslint.org/docs/rules/no-restricted-syntax), which should work for most cases. Otherwise, people can create their own rules. We do have some legacy rules that just disallow syntax (like [`no-undefined`](https://eslint.org/docs/rules/no-undefined)) that we will keep, but we won't be adding any more.
* **Stylistic rules are frozen** - we won't be adding any more options to stylistic rules. We've learned that there's no way to satisfy everyone's personal preferences, and most of the rules already have a lot of difficult-to-understand options. Stylistic rules are those related to spacing, conventions, and generally anything that does not highlight an error or a better way to do something. _Update 2021-01-29: We clarified in [the README](https://github.com/eslint/eslint#stylistic-rule-updates) that we will still support newly-added ECMAScript features._
* **New rule options must be implemented by community members** - People can still propose new options for existing core non-stylistic rules, and we will still evaluate them as usual. However, these approved options will need to be implemented by the community and won't be part of core team's development roadmap. 

## What about bugs?

We will still be evaluating all core rules, including stylistic rules, for bugs. If a bug can be verified, we will still fix it as part of our normal maintenance routine.

## Thanks for your understanding

We know this is a change to how ESLint is operating, and we appreciate your understanding. ESLint is maintained by one part-time developer and a team of volunteers, and so our bandwidth is limited. We're making these changes to make better use of the time we have available to maintain the project. If you'd like to help us, please consider contributing to the project or [making a donation](https://github.com/sponsors/eslint).
