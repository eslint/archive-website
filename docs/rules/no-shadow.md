---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Shadowing (no-shadow)

Shadowing is the process by which a local variable shares the same name as a variable in its containing scope. For example:

```js
var a = 3;
function b() {
    var a = 10;
}
```

In this case, the variable `a` inside of `b()` is shadowing the variable `a` in the global scope. This can cause confusion while reading the code and it's impossible to access the global variable.

## Rule Details

This rule aims to eliminate shadowed variable declarations.

The following patterns are considered warnings:

```js
var a = 3;
function b() {
    var a = 10;
}
```

```js
var a = 3;
var b = function () {
    var a = 10;
}
```

The following patterns are considered okay and do not cause warnings:

```js
var a = 3;
function b(a) {
    a = 10;
}
b(a);
```

## Further Reading

* [Variable Shadowing](http://en.wikipedia.org/wiki/Variable_shadowing)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-shadow.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-shadow.md)
