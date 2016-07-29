---
title: Rule multiline-ternary
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce newlines between operands of ternary expressions (multiline-ternary)

JavaScript allows operands of ternary expressions to be separated by newlines, which can improve the readability of your program.

For example:

```js
var foo = bar > baz ? value1 : value2;
```

The above can be rewritten as the following to improve readability and more clearly delineate the operands:

```js
var foo = bar > baz ?
    value1 :
    value2;
```

## Rule Details

This rule enforces newlines between operands of a ternary expression.
Note: The location of the operators is not enforced by this rule. Please see the [operator-linebreak](operator-linebreak) rule if you are interested in enforcing the location of the operators themselves.

Examples of **incorrect** code for this rule:

```js
/*eslint multiline-ternary: "error"*/

foo > bar ? value1 : value2;

foo > bar ? value :
    value2;

foo > bar ?
    value : value2;
```

Examples of **correct** code for this rule:

```js
/*eslint multiline-ternary: "error"*/

foo > bar ?
    value1 :
    value2;

foo > bar ?
    (baz > qux ?
        value1 :
        value2) :
    value3;
```

## When Not To Use It

You can safely disable this rule if you do not have any strict conventions about whether the operands of a ternary expression should be separated by newlines.

## Related Rules

* [operator-linebreak](operator-linebreak)

## Compatibility

* **JSCS**: [requireMultiLineTernary](http://jscs.info/rule/requireMultiLineTernary)

## Version

This rule was introduced in ESLint 3.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/multiline-ternary.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/multiline-ternary.md)
