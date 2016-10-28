---
title: no-new-func - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Function Constructor (no-new-func)

It's possible to create functions in JavaScript using the `Function` constructor, such as:

```js
var x = new Function("a", "b", "return a + b");
```

This is considered by many to be a bad practice due to the difficulty in debugging and reading these types of functions.

## Rule Details

This error is raised to highlight the use of a bad practice. By passing a string to the Function constructor, you are requiring the engine to parse that string much in the way it has to when you call the `eval` function.

Examples of **incorrect** code for this rule:

```js
/*eslint no-new-func: "error"*/

var x = new Function("a", "b", "return a + b");
var x = Function("a", "b", "return a + b");
```

Examples of **correct** code for this rule:

```js
/*eslint no-new-func: "error"*/

var x = function (a, b) {
    return a + b;
};
```

## When Not To Use It

In more advanced cases where you really need to use the `Function` constructor.

## Version

This rule was introduced in ESLint 0.0.7.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-new-func.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-new-func.md)
