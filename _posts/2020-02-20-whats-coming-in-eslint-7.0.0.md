---
layout: post
title: What's coming in ESLint v7.0.0
tags:
  - major
  - breaking changes
authors:
  - nzakas
categories:
  - API Changes
---

Last week, the Technical Steering Committee (TSC) met to finalize the features for ESLint v7.0.0. This feature set had not yet been locked down even as v7.0.0 work began and so this represented an important milestone that allows us to focus on getting this next major release shipped. You can see everything that is planned for v7.0.0 on our [project board](https://github.com/eslint/eslint/projects/6).

We want to share with you the significant changes that will be coming in v7.0.0 so you can better prepare for the changes and understand why the changes are necessary.

## Significant changes in v7.0.0

The following changes are important to understand as we move towards v7.0.0.

### Dropping support for Node.js v8.x

Node.js v8.x was officially end-of-lifed in December 2019 and so v7.0.0 removes support for this version of Node.js.

### `ESLint` class replacing `CLIEngine` class

From ESLint's early days, we have provided a `CLIEngine` class to allow developers to create ESLint integrations. This class is at the center of things like editor plugins, build tool integrations, and zero-configuration linters. The `CLIEngine` class powers ESLint itself and has been an important part of the project for many years.

Unfortunately, the `CLIEngine` has become the major blocker for many new features. Most significantly, because the `CLIEngine` class works synchronously, it was impossible to do any type of asynchronous operation in the core of ESLint. That limitation meant that features such as parallel linting of files and loading ECMAScript module (ESM) files were impossible to implement.

Several approaches were considered before we decided to replace the `CLIEngine` class with the new `ESLint` class ([more details](https://github.com/eslint/rfcs/pull/40)). The `ESLint` class will contain asynchronous methods that will serve as a jumping off point to introducing asynchronous functionality into the core. To begin, the `ESLint` class will just be a wrapper around `CLIEngine` and we will systematically start writing new functionality into the `ESLint` class over time. Eventually, the `ESLint` and `CLIEngine` classes will be completely separate.

For v7.0.0, the `CLIEngine` class will be deprecated but not removed. We expect to remove `CLIEngine` in a future major release (don't worry, we'll give you plenty of notice before doing that).

### Deprecating Node.js/CommonJS-specific rules

Managing rules in the core is a significant part of ongoing ESLint maintenance. As the project has grown, so has the number of rules we've maintained. We reviewed all of the current rules and decided that the Node.js/CommonJS-specific rules aren't something that makes sense to include in the core going forward. This is especially true as Node.js moves more towards ESM as the preferred module system.

As such, the following rules will be deprecated in the core:

* `callback-return`
* `global-require`
* `handle-callback-err`
* `no-buffer-constructor`
* `no-mixed-requires`
* `no-new-require`
* `no-path-concat`
* `no-process-env`
* `no-process-exit`
* `no-restricted-modules`

These rules will be moved to the [`eslint-plugin-node`](https://github.com/mysticatea/eslint-plugin-node) project. We will be recommending that people use the plugin for these rules going forward. The rules will remain in ESLint for v7.0.0 and will be removed in a future major release.

### Descriptions in directive comments

Directive comment descriptions allow you to leave a note to yourself and other developers as to why you included the comment. For example:

```js
/* eslint-disable no-new -- this class has a side-effect in the constructor. */
```

You can read more in the [RFC](https://github.com/eslint/rfcs/pull/33).

### Warnings for using `~/.eslintrc`

Config files in your home directory were deprecated in v6.7.0 and v7.0.0 will warn when one is used. This feature has long been a source of confusion for ESLint users, especially because ESLint only looks for a config file in the home directory if no other config file is found. The configuration system in ESLint has changed a lot since home directory config files were introduced, and with the additional flexibility we feel there are plenty of other options for configuring ESLint that are clearer than the home directory config file.

Support for home directory config files will be removed in v8.0.0. You can read more in the [RFC](https://github.com/eslint/rfcs/pull/32).

### Updating the base path when using `--config` or `--ignore-path`

In versions prior to v7.0.0, ESLint would resolve references inside of config files or ignore files relative to the file location passed to `--config` or `--ignore-path`. This didn't make much sense and was a source of confusion and unexpected behaviors for users. In v7.0.0, config files and ignore files passed using `--config` or `--ignore-path` use the current working directory as their base path. You can read more in the [RFC](https://github.com/eslint/rfcs/pull/37).

### Plugins loaded from config file directory

In v7.0.0, plugins will be loaded relative to the configs that reference them. You can read more in the [RFC](https://github.com/eslint/rfcs/pull/47).

### File extensions in config files

ESLint v7.0.0 now reads the glob patterns in the `overrides` section of your config to determine which files to lint. Prior to v7.0.0, you would need to provide the `--ext` command line flag to specify the additional files to lint. You can read more in the [RFC](https://github.com/eslint/rfcs/pull/20).

### Updated default ignore patterns

In addition to the current defaults, the default ignore patterns for ESLint will be changed to:

* unignore `.eslintrc.js`
* unignore `/bower_components/*`
* ignore `node_modules/*` in subdirectories

You can read more in the [RFC](https://github.com/eslint/rfcs/pull/51).

### Stricter `RuleTester`

The `RuleTester` class is adding several additional checks to ensure rules are working properly:

* Fails if a rule uses the nonstandard `node.start` or `node.end` properties, which may not be provided by all parsers that ESLint supports.
* Autofix rules must test the output of their fixes.
* Tests where the code has a syntax error will now fail.
* Tests fail if the test specification contains unknown properties.

You can read more in the [RFC](https://github.com/eslint/rfcs/pull/25).

## Installing preview releases of v7.0.0

If you'd like to test v7.0.0 as it's developed, you can install from npm using the `next` tag:

```
npm i eslint@next --save-dev
```

Preview releases are published to the `next` tag periodically until the final v7.0.0 release. Keep in mind that preview releases do not contain all of the changes planned for v7.0.0 and are designed primarily to help us discover bugs and problems upgrading from v6.x.
