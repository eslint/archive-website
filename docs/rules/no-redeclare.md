---
title: Rule no-redeclare
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Redeclaring Variables (no-redeclare)

In JavaScript, it's possible to redeclare the same variable name using `var`. This can lead to confusion as to where the variable is actually declared and initialized.

## Rule Details

This rule is aimed at eliminating variables that have multiple declarations in the same scope.

The following patterns are considered warnings:

```js
var a = 3;
var a = 10;
```

The following patterns are considered okay and do not cause warnings:

```js
var a = 3;
...
a = 10;
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-redeclare.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-redeclare.md)
