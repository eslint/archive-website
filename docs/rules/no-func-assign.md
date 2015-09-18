---
title: Rule no-func-assign
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Function Assignment (no-func-assign)

JavaScript functions can be written as a FunctionDeclaration `function foo() { ... }` or as a FunctionExpression `var foo = function() { ... };`. While a JavaScript interpreter might tolerate it, overwriting/reassigning a function written as a FunctionDeclaration is often indicative of a mistake or issue.

```js
function foo() {}
foo = bar;
```

## Rule Details

This rule is aimed at flagging probable mistakes and issues in the form of overwriting a function that was written as a FunctionDeclaration. As such it will warn when this issue is encountered.

The following patterns are considered problems:

```js
/*eslint no-func-assign: 2*/

function foo() {}
foo = bar;        /*error 'foo' is a function.*/

function foo() {
    foo = bar;    /*error 'foo' is a function.*/
}
```

Unlike the same rule in JSHint, the following pattern is also considered a warning:

```js
/*eslint no-func-assign: 2*/

foo = bar;        /*error 'foo' is a function.*/
function foo() {}
```

The following patterns are not considered problems:

```js
/*eslint no-func-assign: 2*/

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
