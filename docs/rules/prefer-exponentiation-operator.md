---
title: prefer-exponentiation-operator - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/rules/prefer-exponentiation-operator.md
rule_type: suggestion
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow the use of `Math.pow` in favor of the `**` operator (prefer-exponentiation-operator)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Introduced in ES2016, the infix exponentiation operator `**` is an alternative for the standard `Math.pow` function.

Infix notation is considered to be more readable and thus more preferable than the function notation.

## Rule Details

This rule disallows calls to `Math.pow` and suggests using the `**` operator instead.

Examples of **incorrect** code for this rule:

```js
/*eslint prefer-exponentiation-operator: "error"*/

const foo = Math.pow(2, 8);

const bar = Math.pow(a, b);

let baz = Math.pow(a + b, c + d);

let quux = Math.pow(-1, n);
```

Examples of **correct** code for this rule:

```js
/*eslint prefer-exponentiation-operator: "error"*/

const foo = 2 ** 8;

const bar = a ** b;

let baz = (a + b) ** (c + d);

let quux = (-1) ** n;
```

## When Not To Use It

This rule should not be used unless ES2016 is supported in your codebase.

## Further Reading

* [MDN Arithmetic Operators - Exponentiation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Exponentiation)
* [Issue 5848: Exponentiation operator ** has different results for numbers and variables from 50 upwards](https://bugs.chromium.org/p/v8/issues/detail?id=5848)

## Version

This rule was introduced in ESLint 6.7.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/prefer-exponentiation-operator.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/prefer-exponentiation-operator.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/rules/prefer-exponentiation-operator.md)
