---
title: no-div-regex
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-div-regex.md
rule_type: suggestion
related_rules:
- no-control-regex
- no-regex-spaces
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows regular expressions that look like division.

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

function bar() { return /[=]foo/; }
```

## Version

This rule was introduced in ESLint 0.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-div-regex.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-div-regex.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-div-regex.md)
