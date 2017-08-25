---
title: wrap-regex - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/wrap-regex.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Require Regex Literals to be Wrapped (wrap-regex)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

When a regular expression is used in certain situations, it can end up looking like a division operator. For example:

```js
function a() {
    return /foo/.test("bar");
}
```

## Rule Details

This is used to disambiguate the slash operator and facilitates more readable code.

Example of **incorrect** code for this rule:

```js
/*eslint wrap-regex: "error"*/

function a() {
    return /foo/.test("bar");
}
```

Example of **correct** code for this rule:

```js
/*eslint wrap-regex: "error"*/

function a() {
    return (/foo/).test("bar");
}
```

## Version

This rule was introduced in ESLint 0.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/wrap-regex.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/wrap-regex.md)
