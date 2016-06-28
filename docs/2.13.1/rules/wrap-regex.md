---
title: Rule wrap-regex
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Require Regex Literals to be Wrapped (wrap-regex)

When a regular expression is used in certain situations, it can end up looking like a division operator. For example:

```js
function a() {
    return /foo/.test("bar");
}
```

## Rule Details

This is used to disambiguate the slash operator and facilitates more readable code.

The following patterns are considered problems:

```js
/*eslint wrap-regex: "error"*/

function a() {
    return /foo/.test("bar");
}
```

The following patterns are not considered problems:

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
