---
layout: post
title: What's coming in ESLint v8.0.0
tags:
  - major
  - breaking changes
---

Last week, the Technical Steering Committee (TSC) met to finalize the features for ESLint v8.0.0. This feature set had not yet been locked down even as v8.0.0 work began and so this represented an important milestone that allows us to focus on getting this next major release shipped. You can see everything that is planned for v8.0.0 on our [project board](https://github.com/eslint/eslint/projects/8).

We want to share with you the significant changes that will be coming in v8.0.0 so you can better prepare for the changes and understand why the changes are necessary.

## Significant changes in v8.0.0

The following changes are important to understand as we move towards v8.0.0.

### Dropping support for Node.js v10.x, 13.x, and 15.x

Node.js v10.x end-of-life was April 30, 2021, Node.js v13.x end-of-life was June 1, 2020, and Node.js v15.x end-of-life is this month (June 2021). As a result, ESLint v8.0.0 [removes support](https://github.com/eslint/eslint/issues/14023) for all three of these Node.js versions.

### Removing the `codeframe` and `table` formatters

In an ongoing effort to reduce the install size of ESLint, we have decided to [remove the `codeframe` and `table` formatters](https://github.com/eslint/eslint/issues/14277) from the core of ESLint. Both of these formatters include dependencies that aren't used anywhere else in ESLint. If you are using these formatters currently, you'll need to install the standalone packages ([`eslint-formatter-codeframe`](https://www.npmjs.com/package/eslint-formatter-codeframe) and [`eslint-formatter-table`](https://www.npmjs.com/package/eslint-formatter-table)) for use with ESLint v8.0.0.

### Support for ES2022 class fields, top-level `await`, and regexp matching indices

Support for ES2022 [comes to ESLint v8.0.0](https://github.com/eslint/eslint/issues/14343) with native support for class fields, top-level `await`, and regexp matching indices.

### Rules with suggestions now require the `meta.hasSuggestions` property

Beginning in ESLint v8.0.0, rules that provide suggestions [must include a `meta.hasSuggestions: true` property](https://github.com/eslint/eslint/issues/14312). This allows ESLint to understand what a rule's capabilities are just by inspecting the rule object. Rules that provide suggestions without `meta.hasSuggestions: true` will cause an error.

### Fixable rules now require `meta.fixable` property

In ESLint v7.0.0 and earlier, it was possible to write a rule as a function instead of an object and to provide fixes without specifying a `meta.fixable` property. Beginning in v8.0.0, ESLint requires all rules that provide fixes to be specified in object format and [include `meta.fixable: code|whitespace`](https://github.com/eslint/eslint/issues/13349).

### Unused disable directives are now fixable

ESLint v8.0.0 will now automatically [remove unused disable directives](https://github.com/eslint/eslint/issues/11815) when using the `--fix` command line flag along with `--report-unused-disable-directives`.

### Line comment directives

ESLint v8.0.0 now allows [line comment directives](https://github.com/eslint/eslint/issues/14575) for all directives that previously required block comments.

### Stricter rule schema validation

With an [upgrade to Ajv 8](https://github.com/eslint/eslint/issues/13888), ESLint v8.0.0 will have improved error detection for rule schemas. There were several areas where the validation would fail silently with Ajv 6, which could lead to end-user errors that were hard to detect. This stricter validation will help catch more errors earlier in the rule development process.

### Removal of undocumented APIs; removal of `CLIEngine` and `linter`

ESLint v8.0.0 [defines an `exports` field](https://github.com/eslint/eslint/issues/13654) to remove access to undocumented internal APIs that some packages were accessing.

As part of this change, we have removed the deprecated `CLIEngine` class to encourage adoption of the replacement `ESLint` class. `CLIEngine` was [deprecated in 2020](https://eslint.org/blog/2020/05/eslint-v7.0.0-released#new-eslint-class) and we can't continue to support it as we move forward with more ambitious features for ESLint.

Additionally, we are removing the `linter` object as the `Linter` class allows you to create any number of instances.

## When to expect ESLint v8.0.0

We expect the first beta release of ESLint v8.0.0 to be released at the end of June or the beginning of July. At that point, we will gather feedback from the community and fix any outstanding issues that make it difficult for people to upgrade. Availability of the first beta will be announced on this blog and on our [Twitter account](https://twitter.com/geteslint), so please stay tuned!
