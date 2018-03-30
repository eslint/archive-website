---
title: no-func-assign - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-func-assign.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow reassigning `function` declarations (no-func-assign)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

JavaScript functions can be written as a FunctionDeclaration `function foo() { ... }` or as a FunctionExpression `var foo = function() { ... };`. While a JavaScript interpreter might tolerate it, overwriting/reassigning a function written as a FunctionDeclaration is often indicative of a mistake or issue.

```js
function foo() {}
foo = bar;
```

## Rule Details

This rule disallows reassigning `function` declarations.

Examples of **incorrect** code for this rule:

```js
/*eslint no-func-assign: "error"*/

function foo() {}
foo = bar;

function foo() {
    foo = bar;
}
```

Examples of **incorrect** code for this rule, unlike the corresponding rule in JSHint:

```js
/*eslint no-func-assign: "error"*/

foo = bar;
function foo() {}
```

Examples of **correct** code for this rule:

```js
/*eslint no-func-assign: "error"*/

var foo = function () {}
foo = bar;

function foo(foo) { // `foo` is shadowed.
    foo = bar;
}

function foo() {
    var foo = bar;  // `foo` is shadowed.
}
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-func-assign.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-func-assign.md)
