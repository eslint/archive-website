---
title: no-regex-spaces
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-regex-spaces.md
rule_type: suggestion
related_rules:
- no-div-regex
- no-control-regex
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows multiple spaces in regular expression literals.

Regular expressions can be very complex and difficult to understand, which is why it's important to keep them as simple as possible in order to avoid mistakes. One of the more error-prone things you can do with a regular expression is to use more than one space, such as:

```js
var re = /foo   bar/;
```

In this regular expression, it's very hard to tell how many spaces are intended to be matched. It's better to use only one space and then specify how many spaces are expected, such as:

```js
var re = /foo {3}bar/;
```

Now it is very clear that three spaces are expected to be matched.

## Rule Details

This rule disallows multiple spaces in regular expression literals.

Examples of **incorrect** code for this rule:

```js
/*eslint no-regex-spaces: "error"*/

var re = /foo   bar/;
var re = new RegExp("foo   bar");
```

Examples of **correct** code for this rule:

```js
/*eslint no-regex-spaces: "error"*/

var re = /foo {3}bar/;
var re = new RegExp("foo {3}bar");
```

## When Not To Use It

If you want to allow multiple spaces in a regular expression, then you can safely turn this rule off.

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-regex-spaces.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-regex-spaces.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-regex-spaces.md)
