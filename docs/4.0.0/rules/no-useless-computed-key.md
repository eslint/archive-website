---
title: no-useless-computed-key - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary computed property keys on objects (no-useless-computed-key)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

It's unnecessary to use computed properties with literals such as:

```js
var foo = {["a"]: "b"};
```

The code can be rewritten as:

```js
var foo = {"a": "b"};
```

## Rule Details

This rule disallows unnecessary usage of computed property keys.

## Examples

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-computed-key: "error"*/
/*eslint-env es6*/

var a = { ['0']: 0 };
var a = { ['0+1,234']: 0 };
var a = { [0]: 0 };
var a = { ['x']: 0 };
var a = { ['x']() {} };
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-computed-key: "error"*/

var c = { 'a': 0 };
var c = { 0: 0 };
var a = { x() {} };
var c = { a: 0 };
var c = { '0+1,234': 0 };
```

## When Not To Use It

If you don't want to be notified about unnecessary computed property keys, you can safely disable this rule.

## Version

This rule was introduced in ESLint 2.9.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-computed-key.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-computed-key.md)
