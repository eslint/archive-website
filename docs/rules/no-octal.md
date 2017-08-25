---
title: no-octal - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-octal.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow octal literals (no-octal)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Octal literals are numerals that begin with a leading zero, such as:

```js
var num = 071;      // 57
```

Because the leading zero which identifies an octal literal has been a source of confusion and error in JavaScript code, ECMAScript 5 deprecates the use of octal numeric literals.

## Rule Details

The rule disallows octal literals.

If ESLint parses code in strict mode, the parser (instead of this rule) reports the error.

Examples of **incorrect** code for this rule:

```js
/*eslint no-octal: "error"*/

var num = 071;
var result = 5 + 07;
```

Examples of **correct** code for this rule:

```js
/*eslint no-octal: "error"*/

var num  = "071";
```

## Compatibility

* **JSHint**: W115

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-octal.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-octal.md)
