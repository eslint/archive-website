---
title: no-invalid-regexp - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-invalid-regexp.md
rule_type: problem
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow invalid regular expression strings in `RegExp` constructors (no-invalid-regexp)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

An invalid pattern in a regular expression literal is a `SyntaxError` when the code is parsed, but an invalid string in `RegExp` constructors throws a `SyntaxError` only when the code is executed.

## Rule Details

This rule disallows invalid regular expression strings in `RegExp` constructors.

Examples of **incorrect** code for this rule:

```js
/*eslint no-invalid-regexp: "error"*/

RegExp('[')

RegExp('.', 'z')

new RegExp('\\')
```

Examples of **correct** code for this rule:

```js
/*eslint no-invalid-regexp: "error"*/

RegExp('.')

new RegExp

this.RegExp('[')
```

Please note that this rule validates regular expressions per the latest ECMAScript specification, regardless of your parser settings.

If you want to allow additional constructor flags for any reason, you can specify them using the `allowConstructorFlags` option. These flags will then be ignored by the rule.

## Options

This rule has an object option for exceptions:

* `"allowConstructorFlags"` is an array of flags

### allowConstructorFlags

Examples of **correct** code for this rule with the `{ "allowConstructorFlags": ["a", "z"] }` option:

```js
/*eslint no-invalid-regexp: ["error", { "allowConstructorFlags": ["a", "z"] }]*/

new RegExp('.', 'a')

new RegExp('.', 'az')
```

## Further Reading

* [Annotated ES5 §7.8.5 - Regular Expression Literals](https://es5.github.io/#x7.8.5)

## Version

This rule was introduced in ESLint 0.1.4.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-invalid-regexp.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-invalid-regexp.md)
