---
title: Rule no-negated-in-lhs
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow negating the left operand in `in` expressions (no-negated-in-lhs)

## Rule Details

Just as developers might type `-a + b` when they mean `-(a + b)` for the negative of a sum, they might type `!key in object` by mistake when they almost certainly mean `!(key in object)` to test that a key is not in an object.

## Rule Details

This rule disallows negating the left operand in `in` expressions.

Examples of **incorrect** code for this rule:

```js
/*eslint no-negated-in-lhs: "error"*/

if(!key in object) {
    // operator precedence makes it equivalent to (!key) in object
    // and type conversion makes it equivalent to (key ? "false" : "true") in object
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-negated-in-lhs: "error"*/

if(!(key in object)) {
    // key is not in object
}

if(('' + !key) in object) {
    // make operator precedence and type conversion explicit
    // in a rare situation when that is the intended meaning
}
```

## When Not To Use It

Never.

## Version

This rule was introduced in ESLint 0.1.2.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-negated-in-lhs.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-negated-in-lhs.md)
