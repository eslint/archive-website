---
title: Rule no-empty-class
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Empty Character Classes (no-empty-class)

**Deprecation notice**: This rule is deprecated and has been superseded by the [no-empty-character-class](no-empty-character-class) rule. It will be removed in ESLint v1.0.

Empty character classes in regular expressions do not match anything and can result in code that may not work as intended.

```js
var foo = /^abc[]/;
```

## Rule Details

This rule is aimed at highlighting possible typos and unexpected behavior in regular expressions which may arise from the use of empty character classes.

The following patterns are considered warnings:

```js
var foo = /^abc[]/;

/^abc[]/.test(foo);

bar.match(/^abc[]/);
```

The following patterns are not considered warnings:

```js
var foo = /^abc/;

var foo = /^abc[a-z]/;

var bar = new RegExp("^abc[]");
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-empty-class.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-empty-class.md)
