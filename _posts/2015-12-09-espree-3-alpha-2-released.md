---
layout: post
title: Espree v3.0.0 Alpha 2 released
teaser: "We are pleased to share that we've just pushed the second alpha release of Espree v3.0.0. This is a major release with breaking changes, so please be sure to read this post thoroughly."
image: release-notes-beta.png
tags:
  - release
  - breaking
  - alpha
authors:
  - nzakas
categories:
  - Release Notes
---

## Installation

Since Espree v3.0.0 is a prerelease version, you'll need to install it using the `@next` tag:

```
$ npm install espree@next
```

The `@latest` tag is still on the latest v2.x version of Espree.

**Note:** We are providing this release to gather feedback. Help out by [filing issues](https://github.com/eslint/espree/issues/new) if you find a problem.

## Highlights

Here are some highlights of changes in this release.

### Removal of most ecmaFeatures

We introduced `ecmaFeatures` as a way to start incrementally implementing ECMAScript 6 at a time when it was constantly changing. We did this in order to allow people to start using those features that were ready without forcing usage of all features.

Now that ES6 is finalized and all the features are implemented, most people are using all ES6 features and it's a pain to have to manually configure them all. Additionally, there's no good reason to turn on just some features and not all of them (as that's not how the real world works).

In this second alpha release, we've made the following changes:

* Introduced `ecmaVersion` as the way to indicate which version of ECMAScript you want to target. Possible values are 3, 5, and 6.
* Removed all ES6 flags from `ecmaFeatures` (`globalReturn`, `jsx`, and experimental features remain).
* Removed individual checks for ES6 features (could potentially improve performance based on your usage).

In all likelihood, going forward we will probably follow a similar pattern of introducing experimental features using `ecmaFeatures` and then rolling them into a larger `ecmaVersion` grouping later on.

### Exporting VisitorKeys

Tools that use the ESTree format rely on knowledge of the syntax tree in order to work with it. This information tends to be spread amongst various tools. In order to make it easier to work with Espree, we are now exporting `VisitorKeys`, which contains the navigation information that tools like escope and estraverse use to navigate the tree. We're hoping this makes it easier for other tools to understand what Espree is producing.

## Breaking Changes

* Breaking: move ecmaFeatures into ecmaVersion (fixes [#222](https://github.com/eslint/espree/issues/222)) (Nicholas C. Zakas)

## Features

* New: Export VisitorKeys (fixes [#220](https://github.com/eslint/espree/issues/220)) (Nicholas C. Zakas)
