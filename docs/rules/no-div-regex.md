---
title: no-div-regex - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-div-regex.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Regular Expressions That Look Like Division (no-div-regex)

Require regex literals to escape division operators.

```js
function bar() { return /=foo/; }
```

## Rule Details

This is used to disambiguate the division operator to not confuse users.

Examples of **incorrect** code for this rule:

```js
/*eslint no-div-regex: "error"*/

function bar() { return /=foo/; }
```

Examples of **correct** code for this rule:

```js
/*eslint no-div-regex: "error"*/

function bar() { return /\=foo/; }
```

## Related Rules

* [no-control-regex](no-control-regex)
* [no-regex-spaces](no-regex-spaces)

## Version

This rule was introduced in ESLint 0.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-div-regex.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-div-regex.md)
