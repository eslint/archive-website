---
title: Rule new-parens
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require Parens for Constructors (new-parens)

JavaScript allows the omission of parentheses when invoking a function via the `new` keyword and the constructor has no arguments. However, some coders believe that omitting the parentheses is inconsistent with the rest of the language and thus makes code less clear.

```js
var person = new Person;
```

## Rule Details

This rule is aimed at highlighting a lack of convention and increasing code clarity by requiring the use of parentheses when invoking a constructor via the `new` keyword. As such, it will warn when these parentheses are omitted.

The following patterns are considered problems:

```js
/*eslint new-parens: 2*/

var person = new Person; /*error Missing '()' invoking a constructor*/
```

The following patterns are not considered problems:

```js
/*eslint new-parens: 2*/

var person = new Person();
```

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/new-parens.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/new-parens.md)
