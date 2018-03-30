---
title: no-comma-dangle - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-comma-dangle.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# no-comma-dangle: disallow trailing commas in object and array literals

(removed) This rule was **removed** in ESLint v1.0 and **replaced** by the [comma-dangle](comma-dangle) rule.

Trailing commas in object literals are valid according to the ECMAScript 5 (and ECMAScript 3!) spec, however IE8 (when not in IE8 document mode) and below will throw an error when it encounters trailing commas in JavaScript.

```js
var foo = {
    bar: "baz",
    qux: "quux",
};
```

## Rule Details

This rule is aimed at detecting trailing commas in object literals. As such, it will warn whenever it encounters a trailing comma in an object literal.

Examples of **incorrect** code for this rule:

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

Examples of **correct** code for this rule:

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

If your code will not be run in IE8 or below (a Node.js application, for example) and you'd prefer to allow trailing commas, turn this rule off.

## Version

This rule was introduced in ESLint 0.0.9 and removed in 1.0.0-rc-1.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-comma-dangle.md)
