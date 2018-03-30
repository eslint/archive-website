---
title: no-spaced-func - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-spaced-func.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow spacing between function identifiers and their applications (no-spaced-func)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

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

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-spaced-func.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-spaced-func.md)
