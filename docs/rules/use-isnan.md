---
title: Rule use-isnan
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require isNaN() (use-isnan)

In JavaScript, `NaN` is a special value of the `Number` type. It's used to represent any of the "not-a-number" values represented by the double-precision 64-bit format as specified by the IEEE Standard for Binary Floating-Point Arithmetic. `NaN` has the unique property of not being equal to anything, including itself. That is to say, that the condition `NaN !== NaN` evaluates to true.

## Rule Details

This rule is aimed at eliminating potential errors as the result of comparing against the special value `NaN`.

The following patterns are considered problems:

```js
/*eslint use-isnan: 2*/

if (foo == NaN) { /*error Use the isNaN function to compare with NaN.*/
    // ...
}

if (foo != NaN) { /*error Use the isNaN function to compare with NaN.*/
    // ...
}
```

The following patterns are not considered problems:

```js
/*eslint use-isnan: 2*/

if (isNaN(foo)) {
    // ...
}

if (isNaN(NaN)) {
    // ...
}
```

## Further reading

* [Use the isNaN function to compare with NaN](http://jslinterrors.com/use-the-isnan-function-to-compare-with-nan/)

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/use-isnan.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/use-isnan.md)
