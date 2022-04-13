---
title: no-div-regex
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-div-regex.md
rule_type: suggestion
---

<!--FIXABLE-->

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

## Related Rules

* [no-control-regex](no-control-regex)
* [no-regex-spaces](no-regex-spaces)

## Version

This rule was introduced in ESLint 0.1.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-div-regex.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-div-regex.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-div-regex.md)
