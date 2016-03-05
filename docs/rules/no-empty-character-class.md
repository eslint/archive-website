---
title: Rule no-empty-character-class
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Empty Character Classes (no-empty-character-class)

Empty character classes in regular expressions do not match anything and can result in code that may not work as intended.

```js
var foo = /^abc[]/;
```

## Rule Details

This rule is aimed at highlighting possible typos and unexpected behavior in regular expressions which may arise from the use of empty character classes.

Examples of **incorrect** code for this rule:

```js
/*eslint no-empty-character-class: 2*/

var foo = /^abc[]/;

/^abc[]/.test(foo);

bar.match(/^abc[]/);
```

Examples of **correct** code for this rule:

```js
/*eslint no-empty-character-class: 2*/

var foo = /^abc/;

var foo = /^abc[a-z]/;

var bar = new RegExp("^abc[]");
```

## Related Rules

* [no-empty-class](no-empty-class) (removed)

## Version

This rule was introduced in ESLint 0.22.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-empty-character-class.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-empty-character-class.md)
