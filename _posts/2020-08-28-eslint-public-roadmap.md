---
layout: post
title: Announcing ESLint's public roadmap
teaser: "We are happy to announce the first public roadmap of ESLint. Thanks to donations and involved contributors, we have been able to plan development time and future expectations. We hope that this will help to give a better idea of our ongoing resource allocation and how your donations contribute to the project."
tags:
  - Sponsorships
  - Donations
  - Roadmap
  - Planning
authors:
  - nzakas 
categories:
  - Announcements
---

When ESLint [first started accepting donations](https://eslint.org/blog/2019/02/funding-eslint-future), we listed several ways that the project intended to spend the money donated:

* **Paying team members for maintenance and development.** We hired our first part-time maintainer, [Kai Cataldo](https://github.com/kaicataldo), and started paying TSC members on a per-hour basis up to $1,000 each month (the maximum we can afford at the moment).
* **Rewarding contributions from the community.** We have given spot bonuses to people who have made significant contributions to ESLint.
* **Improve documentation.** We are participating in the [2020 Google Season of Docs](https://eslint.org/blog/2020/08/eslint-google-season-of-docs-project-writer) to improve our documentation.
* **Better communication and support.** Paying team members has allowed us to participate in the monthly TC39 tooling meeting and allowed us to pay contributors to help answer questions both in GitHub and in Discord.
* **Developing a Roadmap.** Today, we are announcing our first public roadmap!

That last bullet point, developing a roadmap, is something we've been working hard to figure out for several months. Paying contributors has helped give us insights into how much development time we have each month and what we can reasonably expect in the future. Our roadmap is published as a [GitHub project](https://github.com/orgs/eslint/projects/1) so you can check to see the status of everything we're working on. Here's an overview:

1. **New configuration system.** We've been designing a new configuration system for the past year that is simpler and will hopefully both speed up ESLint as well as make creating plugins and shareable configs easier. ([issue](https://github.com/eslint/eslint/issues/13481))
1. **Google Season of Docs participation.** The Season of Docs program takes several months to complete and will focus on overhauling the configuration documentation. ([issue](https://github.com/eslint/eslint/issues/13130))
1. **Support switching repo branches from `master` to `main`.** In the long term, we will be switching the primary branch in each repo and need to update our tooling to support it. ([issue](https://github.com/eslint/eslint-release/issues/42))
1. **Lint files in parallel.** A long-time desire of the community, we are working towards finally allowing you to lint multiple files in parallel to speed up your linting process. ([issue](https://github.com/eslint/eslint/issues/3565))

Items on the roadmap are large in scale and will take a significant amount of time to complete. Each item is something the team is committed to delivering within the next year, and as such, has a TSC member assigned to complete it. New items may be added any time the TSC decides to accept a feature and we have at least one TSC member committed to implementing it.

We hope that this public roadmap will help us explain more about how our resources are allocated on an ongoing basis and just how your donations are contributing to the maintenance and development of ESLint.
