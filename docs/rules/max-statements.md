---
title: Rule max-statements
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Limit Maximum Number of Statements (max-statements)

The `max-statements` rule allows you to specify the maximum number statements allow in a function.

```js
// max-statements: [1, 2]  // Maximum of 2 statements.
function foo() {
  var bar = 1;
  var baz = 2;

  var qux = 3; // Too many.
}
```

## Rule Details

This rule allows you to configure the maximum number of statements allowed in a function.

The following patterns are considered warnings:

```js
// max-statements: [1, 2]  // Maximum of 2 statements.
function foo() {
  var bar = 1;
  var baz = 2;

  var qux = 3; // Too many.
}
```

The following patterns are not warnings:

```js
// max-statements: [1, 2]  // Maximum of 2 statements.
function foo() {
  var bar = 1;
  return function () {

    // The number of statements in the inner function does not count toward the
    // statement maximum.

    return 42;
  };
}
```

## Related Rules

* [complexity](complexity)
* [max-depth](max-depth)
* [max-len](max-len)
* [max-nested-callbacks](max-nested-callbacks)
* [max-params](max-params)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/max-statements.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/max-statements.md)
