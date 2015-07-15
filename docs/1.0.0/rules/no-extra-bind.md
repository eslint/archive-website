---
title: Rule no-extra-bind
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow unnecessary function binding (no-extra-bind)

Function binding makes no difference in function expressions,
when the function does not use `this`.

```js
var foo = function() {
  do(stuff);
}.bind(bar)
```

## Rule details

The following patterns are considered warnings:

```js
function() {
  foo();
}.bind(bar);
```

```js
function() {
  (function() {
    this.foo();
  }());
}.bind(bar);
```

```js
function() {
  function foo() {
    this.bar();
  }
}.bind(baz);
```

The following patterns are not considered warnings:

```js
function() {
  this.foo();
}.bind(bar);
```

```js
function(a) {
  return a + 1;
}.bind(foo, bar);
```

## Version

This rule was introduced in ESLint 0.8.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-extra-bind.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-bind.md)
