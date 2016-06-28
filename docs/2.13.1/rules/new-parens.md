---
title: Rule new-parens
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# require parentheses when invoking a constructor with no arguments (new-parens)

JavaScript allows the omission of parentheses when invoking a function via the `new` keyword and the constructor has no arguments. However, some coders believe that omitting the parentheses is inconsistent with the rest of the language and thus makes code less clear.

```js
var person = new Person;
```

## Rule Details

This rule requires parentheses when invoking a constructor with no arguments using the `new` keyword in order to increase code clarity.

Examples of **incorrect** code for this rule:

```js
/*eslint new-parens: "error"*/

var person = new Person;
```

Examples of **correct** code for this rule:

```js
/*eslint new-parens: "error"*/

var person = new Person();
```

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/new-parens.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/new-parens.md)
