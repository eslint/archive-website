---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require Just One var Statement Per Scope (one-var)

JavaScript has function scope, not block scope and all variable declarations are hoisted to the top of the function. Therefore, some people believe that all variables in a function scope should be declared in a single variable declaration at the top of the function and not in multiple declarations throughout the function.

```js
function foo() {
    var bar;
    var baz;
}
```

## Rule Details

This rule is aimed at preventing a possible misunderstanding about scoping of variables and to enforce a single variable declaration convention. As such, it will warn when it encounters more than one variable declaration statement in a function scope.

The following patterns are considered warnings:

```js
function foo() {
    var bar;
    var baz;
}

function foo() {
    var bar;

    if (baz) {
        var qux = true;
    }
}
```

The following patterns are not considered warnings:

```js
function foo() {
    var bar,
        baz;
}

function foo() {
    var bar,
        qux;

    if (baz) {
        qux = true;
    }
}
```

## Compatibility

* **JSHint** - This rule maps to the `onevar` JSHint rule.

## Further Reading

[JSLint Errors - Combine this with the previous 'var' statement](http://jslinterrors.com/combine-this-with-the-previous-var-statement/)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/one-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/one-var.md)
