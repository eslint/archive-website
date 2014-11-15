---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Limit Maximum Number of Parameters (max-params)

Functions that take numerous parameters can be difficult to read and write because it requires the memorization of what each parameter is, its type, and the order they should appear in. As a result, many coders adhere to a convention that caps the number of parameters a function can take.

```js
// max-params: [1, 3]

function foo (bar, baz, qux, qxx) { // too many parameters
    doSomething();
}
```

## Rule Details

This rule is aimed at making functions easier to read and write by capping the number of formal arguments a function can accept. As such it will warn when it encounters a function that accepts more than the configured maximum number of parameters.

The following patterns are considered warnings:

```js
// max-params: [1, 3]

function foo (bar, baz, qux, qxx) { // too many parameters
    doSomething();
}
```

The following patterns are not considered warnings:

```js
// max-params: [1, 3]

function foo (bar, baz, qux) {
    doSomething();
}
```

## Related Rules

* [complexity](complexity.html)
* [max-depth](max-depth.html)
* [max-len](max-len.html)
* [max-nested-callbacks](max-nested-callbacks.html)
* [max-statements](max-statements.html)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/max-params.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/max-params.md)
