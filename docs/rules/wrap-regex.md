---
title: wrap-regex
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/wrap-regex.md
rule_type: layout
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Requires regex literals to be wrapped.

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

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/wrap-regex.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/wrap-regex.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/wrap-regex.md)
