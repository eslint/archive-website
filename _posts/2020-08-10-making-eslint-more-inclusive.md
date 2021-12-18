---
layout: post
title: Making ESLint more inclusive
tags:
  - Inclusivity
  - Diversity
  - Code of Conduct
authors:
  - nzakas
  - kaicataldo
categories:
  - Announcements
---

From its beginning, the ESLint project has sought to be a place that is welcoming and inclusive of everyone. We adopted a code of conduct before doing so was common (even before we joined the jQuery Foundation, now the OpenJS Foundation) and the project has been maintained by a group of developers from all around the world, representing a variety of ethnicities, cultures, and countries. Even so, we understand that inclusivity is a process that must be adapted as we learn and grow. There is always some way to be more welcoming, and today we're happy to share with you some of our recent efforts.

## Eliminating problematic terminology

One of the areas where we've made changes in the project is through the use of more inclusive terminology. We recently did an audit of our codebase to look for words with negative connotations. In doing so, we discovered that we had a few instances of the word "blacklist" in the project, not just inside of code but also in the name of the `id-blacklist` rule.

In v7.4.0 we renamed the `id-blacklist` rule to [`id-denylist`](https://eslint.org/docs/rules/id-denylist) while providing a fallback so existing ESLint configs wouldn't break. In v7.5.0 we officially deprecated the `id-blacklist` rule. It's our policy not to remove deprecated rules, but we will no longer be maintaining the `id-blacklist` rule. Any further changes will be made only to the `id-denylist` rule.

Going forward, we will be avoiding the use of the following terms:

* Blacklist
* Whitelist
* Master
* Slave

While not all of these words trace back to racist origins, they do all have negative connotations that can make people uncomfortable and perpetuate unconscious bias. We want ESLint to be a project that everyone is comfortable participating in, and proud of contributing to, and using more inclusive language helps.

## What about the master branch?

Like many open source projects, our primary development branch is called `master`. We are in the process of transitioning each repository to use `main` as the primary development branch. This will be a gradual rollout as we work through our least active repositories towards `eslint`, our most active repository. A large amount of our infrastructure tooling assumes that `master` is the primary development branch, so it will take us some time and we may need to wait for the [GitHub tooling](https://github.com/github/renaming) to complete this work.

## Moving forward

We want everyone to feel empowered to contribute to ESLint, and to know that when they do, they feel welcome, safe, and included. This latest small action is just a part of our ongoing effort to more inclusive, and we hope other open source projects will do the same.
