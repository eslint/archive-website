---
title: no-unsafe-negation - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-unsafe-negation.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow negating the left operand of relational operators (no-unsafe-negation)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Just as developers might type `-a + b` when they mean `-(a + b)` for the negative of a sum, they might type `!key in object` by mistake when they almost certainly mean `!(key in object)` to test that a key is not in an object. `!obj instanceof Ctor` is similar.

## Rule Details

This rule disallows negating the left operand of [Relational Operators](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Expressions_and_Operators#Relational_operators).

Relational Operators are:

- `in` operator.
- `instanceof` operator.

Examples of **incorrect** code for this rule:

```js
/*eslint no-unsafe-negation: "error"*/

if (!key in object) {
    // operator precedence makes it equivalent to (!key) in object
    // and type conversion makes it equivalent to (key ? "false" : "true") in object
}

if (!obj instanceof Ctor) {
    // operator precedence makes it equivalent to (!obj) instanceof Ctor
    // and it equivalent to always false since boolean values are not objects.
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-unsafe-negation: "error"*/

if (!(key in object)) {
    // key is not in object
}

if (!(obj instanceof Ctor)) {
    // obj is not an instance of Ctor
}

if(("" + !key) in object) {
    // make operator precedence and type conversion explicit
    // in a rare situation when that is the intended meaning
}
```

## Options

Nothing.

## When Not To Use It

If you don't want to notify unsafe logical negations, then it's safe to disable this rule.

## Version

This rule was introduced in ESLint 3.3.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-unsafe-negation.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-unsafe-negation.md)
