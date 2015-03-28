---
title: Rule no-undef-init
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Initializing to undefined (no-undef-init)

In JavaScript, a variable that is declared and not initialized to any value automatically gets the value of `undefined`. For example:

```js
var foo;

console.log(foo === undefined);     // true
```

It's therefore unnecessary to initialize a variable to `undefined`, such as:

```js
var foo = undefined;
```

It's considered a best practice to avoid initializing variables to `undefined`.

## Rule Details

This rule aims to eliminate variable declarations that initialize to `undefined`.

The following patterns are considered warnings:

```js
var foo = undefined;
let bar = undefined;
```

The following patterns are not warnings:

```js
var foo;
let bar;
```

## When Not To Use It

If you want to allow initialization of variables with `undefined`, then you can safely turn this rule off.

## Related Rules

* [no-undefined](no-undefined)
* [no-void](no-void)

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-undef-init.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-undef-init.md)
