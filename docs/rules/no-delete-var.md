---
title: no-delete-var - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow deleting variables (no-delete-var)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

The purpose of the `delete` operator is to remove a property from an object. Using the `delete` operator on a variable might lead to unexpected behavior.

## Rule Details

This rule disallows the use of the `delete` operator on variables.

If ESLint parses code in strict mode, the parser (instead of this rule) reports the error.

Examples of **incorrect** code for this rule:

```js
/*eslint no-delete-var: "error"*/

var x;
delete x;
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-delete-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-delete-var.md)
