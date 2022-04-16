---
title: no-spaced-func
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-spaced-func.md
rule_type: layout
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows spacing between function identifiers and their applications.

This rule was **deprecated** in ESLint v3.3.0 and replaced by the [func-call-spacing](func-call-spacing) rule.

While it's possible to have whitespace between the name of a function and the parentheses that execute it, such patterns tend to look more like errors.

## Rule Details

This rule disallows spacing between function identifiers and their applications.

Examples of **incorrect** code for this rule:

```js
/*eslint no-spaced-func: "error"*/

fn ()

fn
()
```

Examples of **correct** code for this rule:

```js
/*eslint no-spaced-func: "error"*/

fn()
```

## Version

This rule was introduced in ESLint 0.1.2.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-spaced-func.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-spaced-func.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-spaced-func.md)
