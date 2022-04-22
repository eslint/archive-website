---
title: multiline-comment-style
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/multiline-comment-style.md
rule_type: suggestion
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Enforces a particular style for multiline comments.

Many style guides require a particular style for comments that span multiple lines. For example, some style guides prefer the use of a single block comment for multiline comments, whereas other style guides prefer consecutive line comments.

## Rule Details

This rule aims to enforce a particular style for multiline comments.

### Options

This rule has a string option, which can have one of the following values:

* `"starred-block"` (default): Disallows consecutive line comments in favor of block comments. Additionally, requires block comments to have an aligned `*` character before each line.
* `"bare-block"`: Disallows consecutive line comments in favor of block comments, and disallows block comments from having a `"*"` character before each line.
* `"separate-lines"`: Disallows block comments in favor of consecutive line comments

The rule always ignores directive comments such as `/* eslint-disable */`. Additionally, unless the mode is `"starred-block"`, the rule ignores JSDoc comments.

Examples of **incorrect** code for this rule with the default `"starred-block"` option:

```js

/* eslint multiline-comment-style: ["error", "starred-block"] */

// this line
// calls foo()
foo();

/* this line
calls foo() */
foo();

/* this comment
 * is missing a newline after /*
 */

/*
 * this comment
 * is missing a newline at the end */

/*
* the star in this line should have a space before it
 */

/*
 * the star on the following line should have a space before it
*/

```

Examples of **correct** code for this rule with the default `"starred-block"` option:

```js
/* eslint multiline-comment-style: ["error", "starred-block"] */

/*
 * this line
 * calls foo()
 */
foo();

// single-line comment
```

Examples of **incorrect** code for this rule with the `"bare-block"` option:

```js
/* eslint multiline-comment-style: ["error", "bare-block"] */

// this line
// calls foo()
foo();

/*
 * this line
 * calls foo()
 */
foo();
```

Examples of **correct** code for this rule with the `"bare-block"` option:

```js
/* eslint multiline-comment-style: ["error", "bare-block"] */

/* this line
   calls foo() */
foo();
```

Examples of **incorrect** code for this rule with the `"separate-lines"` option:

```js

/* eslint multiline-comment-style: ["error", "separate-lines"] */

/* This line
calls foo() */
foo();

/*
 * This line
 * calls foo()
 */
foo();

```

Examples of **correct** code for this rule with the `"separate-lines"` option:

```js
/* eslint multiline-comment-style: ["error", "separate-lines"] */

// This line
// calls foo()
foo();

```

## When Not To Use It

If you don't want to enforce a particular style for multiline comments, you can disable the rule.

## Version

This rule was introduced in ESLint 4.10.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/multiline-comment-style.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/multiline-comment-style.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/multiline-comment-style.md)
