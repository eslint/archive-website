---
title: new-parens - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/new-parens.md
rule_type: layout
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# require parentheses when invoking a constructor with no arguments (new-parens)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

JavaScript allows the omission of parentheses when invoking a function via the `new` keyword and the constructor has no arguments. However, some coders believe that omitting the parentheses is inconsistent with the rest of the language and thus makes code less clear.

```js
var person = new Person;
```

## Rule Details

This rule can enforce or disallow parentheses when invoking a constructor with no arguments using the `new` keyword.

## Options

This rule takes one option.

- `"always"` enforces parenthesis after a new constructor with no arguments (default)
- `"never"` enforces no parenthesis after a new constructor with no arguments

### always

Examples of **incorrect** code for this rule with the `"always"` option:

```js
/*eslint new-parens: "error"*/

var person = new Person;
var person = new (Person);
```

Examples of **correct** code for this rule with the `"always"` option:

```js
/*eslint new-parens: "error"*/

var person = new Person();
var person = new (Person)();
```

### never

Examples of **incorrect** code for this rule with the `"never"` option:

```js
/*eslint new-parens: ["error", "never"]*/

var person = new Person();
var person = new (Person)();
```

Examples of **correct** code for this rule with the `"never"` option:

```js
/*eslint new-parens: ["error", "never"]*/

var person = new Person;
var person = (new Person);
var person = new Person("Name");
```

## Version

This rule was introduced in ESLint 0.0.6.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/new-parens.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/new-parens.md)
