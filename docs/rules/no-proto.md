---
title: Rule no-proto
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Use of `__proto__` (no-proto)

`__proto__` property has been deprecated as of ECMAScript 3.1 and shouldn't be used in the code. Use `getPrototypeOf` method instead.

## Rule Details

When an object is created `__proto__` is set to the original prototype property of the object’s constructor function. `getPrototypeOf` is the preferred method of getting "the prototype".

Examples of **incorrect** code for this rule:

```js
/*eslint no-proto: "error"*/

var a = obj.__proto__;

var a = obj["__proto__"];
```

Examples of **correct** code for this rule:

```js
/*eslint no-proto: "error"*/

var a = Object.getPrototypeOf(obj);
```

## When Not To Use It

If you need to support legacy browsers, you might want to turn this rule off, since support for `getPrototypeOf` is not yet universal.

## Further Reading

* [Object.getPrototypeOf](http://ejohn.org/blog/objectgetprototypeof/)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-proto.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-proto.md)
