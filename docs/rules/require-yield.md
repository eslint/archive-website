---
title: require-yield - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/require-yield.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow generator functions that do not have `yield` (require-yield)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

## Rule Details

This rule generates warnings for generator functions that do not have the `yield` keyword.

## Examples

Examples of **incorrect** code for this rule:

```js
/*eslint require-yield: "error"*/
/*eslint-env es6*/

function* foo() {
  return 10;
}
```

Examples of **correct** code for this rule:

```js
/*eslint require-yield: "error"*/
/*eslint-env es6*/

function* foo() {
  yield 5;
  return 10;
}

function foo() {
  return 10;
}

// This rule does not warn on empty generator functions.
function* foo() { }
```

## When Not To Use It

If you don't want to notify generator functions that have no `yield` expression, then it's safe to disable this rule.

## Related Rules

* [require-await](require-await)

## Version

This rule was introduced in ESLint 1.0.0-rc-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/require-yield.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/require-yield.md)
