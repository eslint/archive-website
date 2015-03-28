---
title: Rule no-comma-dangle
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Dangling Commas (no-comma-dangle)

**Deprecation notice**: This rule is deprecated and has been superseded by the [comma-dangle](comma-dangle) rule. It will be removed in ESLint v1.0.

Trailing commas in object literals are valid according to the ECMAScript 5 (and ECMAScript 3!) spec, however IE8 (when not in IE8 document mode) and below will throw an error when it encounters trailing commas in JavaScript.

```js
var foo = {
    bar: "baz",
    qux: "quux",
};
```

## Rule Details

This rule is aimed at detecting trailing commas in object literals. As such, it will warn whenever it encounters a trailing comma in an object literal.

The following are considered warnings:

```js
var foo = {
    bar: "baz",
    qux: "quux",
};

var arr = [1,2,];

foo({
  bar: "baz",
  qux: "quux",
});
```

The following are okay and will not raise warnings:

```js
var foo = {
    bar: "baz",
    qux: "quux"
};

var arr = [1,2];

foo({
  bar: "baz",
  qux: "quux"
});
```

## When Not To Use It

If your code will not be run in IE8 or below (a NodeJS application, for example) and you'd prefer to allow trailing commas, turn this rule off.

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-comma-dangle.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-comma-dangle.md)
