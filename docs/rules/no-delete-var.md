---
title: no-delete-var
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-delete-var.md
rule_type: suggestion
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Disallows deleting variables.

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

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-delete-var.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-delete-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-delete-var.md)
