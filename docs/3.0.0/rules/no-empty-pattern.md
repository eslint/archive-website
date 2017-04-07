---
title: no-empty-pattern - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow empty destructuring patterns (no-empty-pattern)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

When using destructuring, it's possible to create a pattern that has no effect. This happens when empty curly braces are used to the right of an embedded object destructuring pattern, such as:

```js
// doesn't create any variables
var {a: {}} = foo;
```

In this code, no new variables are created because `a` is just a location helper while the `{}` is expected to contain the variables to create, such as:

```js
// creates variable b
var {a: { b }} = foo;
```

In many cases, the empty object pattern is a mistake where the author intended to use a default value instead, such as:

```js
// creates variable a
var {a = {}} = foo;
```

The difference between these two patterns is subtle, especially because the problematic empty pattern looks just like an object literal.

## Rule Details

This rule aims to flag any empty patterns in destructured objects and arrays, and as such, will report a problem whenever one is encountered.

Examples of **incorrect** code for this rule:

```js
/*eslint no-empty-pattern: "error"*/

var {} = foo;
var [] = foo;
var {a: {}} = foo;
var {a: []} = foo;
function foo({}) {}
function foo([]) {}
function foo({a: {}}) {}
function foo({a: []}) {}
```

Examples of **correct** code for this rule:

```js
/*eslint no-empty-pattern: "error"*/

var {a = {}} = foo;
var {a = []} = foo;
function foo({a = {}}) {}
function foo({a = []}) {}
```

## Version

This rule was introduced in ESLint 1.7.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-empty-pattern.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-empty-pattern.md)
