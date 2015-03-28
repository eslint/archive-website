---
title: Rule no-extra-semi
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Extra Semicolons (no-extra-semi)

JavaScript will more or less let you put semicolons after any statement without complaining. Typos and misunderstandings about where semicolons are required can lead to extra semicolons that are unnecessary.


## Rule Details

This rule is aimed at eliminating extra unnecessary semicolons. While not technically an error, extra semicolons can be a source of confusion when reading code.

The following patterns are considered warnings:

```js
var x = 5;;

function foo() {
    // code
};

```

The following patterns are not considered warnings:

```js
var x = 5;

var foo = function() {
    // code
};

```

## When Not To Use It

If you intentionally use extra semicolons then you can disable this rule.

## Related Rules

* [semi](semi)
* [no-space-before-semi](no-space-before-semi)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-extra-semi.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-semi.md)
