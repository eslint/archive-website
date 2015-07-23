---
title: Rule no-use-before-define
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Early Use (no-use-before-define)

In JavaScript, prior to ES6, variable and function declarations are hoisted to the top of a scope, so it's possible to use identifiers before their formal declarations in code. This can be confusing and some believe it is best to always declare variables and functions before using them.

In ES6, block-level bindings (`let` and `const`) introduce a "temporal dead zone" where a `ReferenceError` will be thrown with any attempt to access the variable before its declaration.

## Rule Details

This rule will warn when it encounters a reference to an identifier that has not been yet declared.

The following patterns are considered warnings:

```js
alert(a);
var a = 10;

f();
function f() {}

function g() {
    return b;
}
var b = 1;

// With blockBindings: true
{
    alert(c);
    let c = 1;
}
```

The following patterns are not considered warnings:

```js
var a;
a = 10;
alert(a);

function f() {}
f(1);

var b = 1;
function g() {
    return b;
}

// With blockBindings: true
{
    let C;
    c++;
}
```


The rule accepts an additional option that can take the value `"nofunc"`. If this option is active, function declarations are exempted from the rule, so it is allowed to use a function name *before* its declaration.

The following patterns are not considered warnings when `"nofunc"` is specified:

```js
f();

function f() {}
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-use-before-define.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-use-before-define.md)
