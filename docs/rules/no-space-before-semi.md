---
title: Rule no-space-before-semi
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# no-space-before-semi: disallow spaces before semicolons

(removed) This rule was **removed** in ESLint v1.0 and **replaced** by the [semi-spacing](semi-spacing) rule.

JavaScript allows for placing unnecessary spaces between an expression and the closing semicolon.

Space issues can also cause code to look inconsistent and harder to read.

```js
var thing = function () {
  var test = 12 ;
}  ;
```

## Rule Details

This rule prevents the use of spaces before a semicolon in expressions.

The following patterns are considered problems:

```js
var foo = "bar" ;

var foo = function() {} ;

var foo = function() {
} ;

var foo = 1 + 2 ;
```

The following patterns are not considered problems:

```js
;(function(){}());

var foo = "bar";
```

## Related Rules

* [semi](semi)
* [no-extra-semi](no-extra-semi)

## Version

This rule was introduced in ESLint 0.4.3 and removed in 1.0.0-rc-1.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-space-before-semi.md)
