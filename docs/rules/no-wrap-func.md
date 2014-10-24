---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Parens Around Functions (no-wrap-func)

Although it's possible to wrap functions in parentheses, this can be confusing when the code also contains immediately-invoked function expressions (IIFEs) since parentheses are often used to make this distinction. For example:

```js
var foo = (function() {
	// IIFE
}());

var bar = (function() {
	// not an IIFE
});
```

## Rule Details

This rule will raise a warning when it encounters a function expression wrapped in parentheses with no following invoking parentheses.

The following patterns are considered warnings:

```js
var a = (function() {...});
```

The following patterns are considered okay and do not cause warnings:

```js
var a = function() {...};

(function() {...})();
```

## Further Reading

* [Wrapping non-IIFE function literals in parens is unnecessary](http://jslinterrors.com/wrapping-non-iife-function-literals-in-parens/)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-wrap-func.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-wrap-func.md)
