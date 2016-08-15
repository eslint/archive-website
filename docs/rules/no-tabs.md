---
title: no-tabs - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow tabs in file (no-tabs)

some style guides don't allow the use of tab characters anywhere. So they would want to disallow tab anywhere inside a file including comments.

## Rule Details

This rule looks for tabs inside the file. It can abe anywhere inside code or comments or anything.

Examples of **incorrect** code for this rule:

```js
var a /t= 2;

/**
* /t/t its a test function
*/
function test(){}

var x = 1; // /t test
```

Examples of **correct** code for this rule:

```js
var a = 2;

/**
* its a test function
*/
function test(){}

var x = 1; // test
```

## When Not To Use It

If you have established a standard where having tabs is fine.

## Compatibility

* **JSCS**: [disallowTabs](http://jscs.info/rule/disallowTabs)

## Version

This rule was introduced in ESLint 3.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-tabs.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-tabs.md)
