---
title: no-trailing-spaces - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow trailing whitespace at the end of lines (no-trailing-spaces)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Sometimes in the course of editing files, you can end up with extra whitespace at the end of lines. These whitespace differences can be picked up by source control systems and flagged as diffs, causing frustration for developers. While this extra whitespace causes no functional issues, many code conventions require that trailing spaces be removed before check-in.

## Rule Details

This rule disallows trailing whitespace (spaces, tabs, and other Unicode whitespace characters) at the end of lines.

Examples of **incorrect** code for this rule:

```js
/*eslint no-trailing-spaces: "error"*/

var foo = 0;//•••••
var baz = 5;//••
//•••••
```

Examples of **correct** code for this rule:

```js
/*eslint no-trailing-spaces: "error"*/

var foo = 0;
var baz = 5;
```

## Options

This rule has an object option:

* `"skipBlankLines": false` (default) disallows trailing whitespace on empty lines
* `"skipBlankLines": true` allows trailing whitespace on empty lines

### skipBlankLines

Examples of **correct** code for this rule with the `{ "skipBlankLines": true }` option:

```js
/*eslint no-trailing-spaces: ["error", { "skipBlankLines": true }]*/

var foo = 0;
var baz = 5;
//•••••
```

## Version

This rule was introduced in ESLint 0.7.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-trailing-spaces.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-trailing-spaces.md)
