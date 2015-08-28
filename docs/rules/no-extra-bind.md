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
  console.log("not using this");
}.bind(bar)
```

## Rule details

The following patterns are considered warnings:

```js
/*eslint no-extra-bind: 2*/

var x = function () {   /*error The function binding is unnecessary.*/
  foo();
}.bind(bar);
```

```js
/*eslint no-extra-bind: 2*/

var x = function () {   /*error The function binding is unnecessary.*/
  (function () {
    this.foo();
  }());
}.bind(bar);
```

```js
/*eslint no-extra-bind: 2*/

var x = function () {  /*error The function binding is unnecessary.*/
  function foo() {
    this.bar();
  }
}.bind(baz);
```

The following patterns are not considered warnings:

```js
/*eslint no-extra-bind: 2*/

var x = function () {
  this.foo();
}.bind(bar);
```

```js
/*eslint no-extra-bind: 2*/

var x = function (a) {
  return a + 1;
}.bind(foo, bar);
```

## Version

This rule was introduced in ESLint 0.8.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-extra-bind.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-bind.md)
