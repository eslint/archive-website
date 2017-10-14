---
title: block-spacing - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/block-spacing.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow or enforce spaces inside of blocks after opening block and before closing block (block-spacing)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

## Rule Details

This rule enforces consistent spacing inside an open block token and the next token on the same line. This rule also enforces consistent spacing inside a close block token and previous token on the same line.

## Options

This rule has a string option:

* `"always"` (default) requires one or more spaces
* `"never"` disallows spaces

### always

Examples of **incorrect** code for this rule with the default `"always"` option:

```js
/*eslint block-spacing: "error"*/

function foo() {return true;}
if (foo) { bar = 0;}
function baz() {let i = 0;
    return i;
}
```

Examples of **correct** code for this rule with the default `"always"` option:

```js
/*eslint block-spacing: "error"*/

function foo() { return true; }
if (foo) { bar = 0; }
```

### never

Examples of **incorrect** code for this rule with the `"never"` option:

```js
/*eslint block-spacing: ["error", "never"]*/

function foo() { return true; }
if (foo) { bar = 0;}
```

Examples of **correct** code for this rule with the `"never"` option:

```js
/*eslint block-spacing: ["error", "never"]*/

function foo() {return true;}
if (foo) {bar = 0;}
```

## When Not To Use It

If you don't want to be notified about spacing style inside of blocks, you can safely disable this rule.

## Version

This rule was introduced in ESLint 1.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/block-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/block-spacing.md)
