---
title: Rule require-yield
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow generator functions that do not have `yield` (require-yield)

This rule generates warnings for generator functions that do not have the `yield` keyword.

## Rule details

The following patterns are considered problems:

```js
/*eslint require-yield: 2*/
/*eslint-env es6*/

function* foo() { /*error This generator function does not have `yield`.*/
  return 10;
}
```

The following patterns are not considered problems:

```js
/*eslint require-yield: 2*/
/*eslint-env es6*/

function* foo() {
  yield 5;
  return 10;
}

function foo() {
  return 10;
}

// This rule does not warn on empty generator functions.
function* foo() { }
```

## Version

This rule was introduced in ESLint 1.0.0-rc-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/require-yield.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/require-yield.md)
