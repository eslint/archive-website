---
title: no-void - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow use of the void operator. (no-void)

The `void` operator takes an operand and returns `undefined`: `void expression` will evaluate `expression` and return `undefined`. It can be used to ignore any side effects `expression` may produce:

The common case of using `void` operator is to get a "pure" `undefined` value as prior to ES5 the `undefined` variable was mutable:

```js
// will always return undefined
(function(){
    return void 0;
})();

// will return 1 in ES3 and undefined in ES5+
(function(){
    undefined = 1;
    return undefined;
})();

// will throw TypeError in ES5+
(function(){
    'use strict';
    undefined = 1;
})();
```

Another common case is to minify code as `void 0` is shorter than `undefined`:

```js
foo = void 0;
foo = undefined;
```

When used with IIFE (immediately-invoked function expression), `void` can be used to force the function keyword to be treated as an expression instead of a declaration:

```js
var foo = 1;
void function(){ foo = 1; }() // will assign foo a value of 1
+function(){ foo = 1; }() // same as above
```

```
function(){ foo = 1; }() // will throw SyntaxError
```

Some code styles prohibit `void` operator, marking it as non-obvious and hard to read.

## Rule Details

This rule aims to eliminate use of void operator.

Examples of **incorrect** code for this rule:

```js
/*eslint no-void: "error"*/

void foo

var foo = void bar();
```

## When Not To Use It

If you intentionally use the `void` operator then you can disable this rule.

## Further Reading

* [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void)
* [Bad Parts: Appendix B - JavaScript: The Good Parts by Douglas Crockford](http://oreilly.com/javascript/excerpts/javascript-good-parts/bad-parts.html)

## Related Rules

* [no-undef-init](no-undef-init)
* [no-undefined](no-undefined)

## Version

This rule was introduced in ESLint 0.8.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-void.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-void.md)
