---
title: space-return-throw-case - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# space-return-throw-case: require spaces after `return`, `throw`, and `case` keywords

(removed) This rule was **removed** in ESLint v2.0 and **replaced** by the [keyword-spacing](keyword-spacing) rule.

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) automatically fixed problems reported by this rule.

Require spaces following `return`, `throw`, and `case`.

## Rule Details

Examples of **incorrect** code for this rule:

```js
/*eslint space-return-throw-case: "error"*/

throw{a:0}

function f(){ return-a; }

switch(a){ case'a': break; }
```

Examples of **correct** code for this rule:

```js
/*eslint space-return-throw-case: "error"*/

throw {a: 0};

function f(){ return -a; }

switch(a){ case 'a': break; }
```

## Version

This rule was introduced in ESLint 0.1.4 and removed in 2.0.0-beta.3.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-return-throw-case.md)
