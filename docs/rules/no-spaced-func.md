---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Spaces in Function Calls (no-spaced-func)

While it's possible to have whitespace between the name of a function and the parentheses that execute it, such patterns tend to look more like errors.

## Rule Details

This rule does not allow gaps between the function identifier and application.

```js
fn ()
```

The following patterns are considered warnings:

```js
fn ()
```

```js
fn
()
```

The following patterns are not warnings:

```js
fn()
```


## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-spaced-func.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-spaced-func.md)
