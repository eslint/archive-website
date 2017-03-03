---
title: dot-location - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce newline before and after dot (dot-location)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

JavaScript allows you to place newlines before or after a dot in a member expression.

Consistency in placing a newline before or after the dot can greatly increase readability.

```js
var a = universe.
        galaxy;

var b = universe
       .galaxy;
```

## Rule Details

This rule aims to enforce newline consistency in member expressions. This rule prevents the use of mixed newlines around the dot in a member expression.

## Options

The rule takes one option, a string:

* If it is `"object"`, the dot in a member expression should be on the same line as the object portion. The default is `"object"`.
* If it is `"property"`, the dot in a member expression should be on the same line as the property portion.

### object

The default `"object"` option requires the dot to be on the same line as the object.

Examples of **incorrect** code for the default `"object"` option:

```js
/*eslint dot-location: ["error", "object"]*/

var foo = object
.property;
```

Examples of **correct** code for the default `"object"` option:

```js
/*eslint dot-location: ["error", "object"]*/

var foo = object.
property;
var bar = object.property;
```

### property

The `"property"` option requires the dot to be on the same line as the property.

Examples of **incorrect** code for the `"property"` option:

```js
/*eslint dot-location: ["error", "property"]*/

var foo = object.
property;
```

Examples of **correct** code for the `"property"` option:

```js
/*eslint dot-location: ["error", "property"]*/

var foo = object
.property;
var bar = object.property;
```

## When Not To Use It

You can turn this rule off if you are not concerned with the consistency of newlines before or after dots in member expressions.

## Related Rules

* [newline-after-var](newline-after-var)
* [dot-notation](dot-notation)

## Version

This rule was introduced in ESLint 0.21.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/dot-location.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/dot-location.md)
