---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow multiple spaces (no-multi-spaces)

It's a good practice to add whitespace in expressions to enhance readability of code such as:

```js

if(foo === "bar") {}

```

In cases where more than one whitespace is added, it can lead to ugly and inconsistent looking code such as:

```js

if(foo  === "bar") {}

```

## Rule Details

This rule aims to disallow multiple whitespace around logical expressions, conditional expressions, declarations, array elements, object properties, sequences and function parameters.

The following patterns are considered warnings:

```js
var a =  1;
```

```js
if(foo   === "bar") {}
```

```js
a <<  b
```

```js
var arr = [1,  2];
```

```js
a ?  b: c
```

The following patterns are not warnings:

```js
var a = 1;
```

```js
if(foo === "bar") {}
```

```js
a << b
```

```js
var arr = [1, 2];
```

```js
a ? b: c
```

## When Not To Use It

If you don't want to check and disallow multiple spaces, then you should turn this rule off.

## Related Rules

* [space-infix-ops](space-infix-ops.html)
* [space-in-brackets](space-in-brackets.html)
* [space-in-parens](space-in-parens.html)
* [space-after-keywords](space-after-keywords)
* [space-unary-word-ops](space-unary-word-ops)
* [space-return-throw-case](space-return-throw-case)


## Version

This rule was introduced in ESLint 0.9.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-multi-spaces.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-multi-spaces.md)
