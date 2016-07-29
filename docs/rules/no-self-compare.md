---
title: Rule no-self-compare
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Self Compare (no-self-compare)

Comparing a variable against itself is usually an error, either an typo or refactoring error. It is confusing to the reader and may potentially introduce a runtime error.

The only time you would compare a variable against itself is when you are testing for `NaN`. However, it is far more appropriate to use `typeof x === 'number' && isNaN(x)` or the [Number.isNaN ES2015 function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN) for that use case rather than leaving the reader of the code to determine the intent of self comparison.

## Rule Details

This error is raised to highlight a potentially confusing and potentially pointless piece of code. There are almost no situations in which you would need to compare something to itself.

Examples of **incorrect** code for this rule:

```js
/*eslint no-self-compare: "error"*/

var x = 10;
if (x === x) {
    x = 20;
}
```

## Further Reading

* [Weird Relation](http://jslinterrors.com/weird-relation/)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-self-compare.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-self-compare.md)
