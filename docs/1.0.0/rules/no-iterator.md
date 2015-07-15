---
title: Rule no-iterator
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Iterator (no-iterator)

The `__iterator__` property can used to create custom iterators that are compatible with JavaScript's `for in` and `for each` constructs. However, this property is not supported in many browsers, so it should be used with caution.

```js
Foo.prototype.__iterator__ = function() {
    return new FooIterator(this);
}
```

## Rule Details

This rule is aimed at preventing errors that may arise from using the `__iterator__` property, which is not implemented in several browsers. As such, it will warn whenever it encounters the `__iterator__` property.

The following patterns are considered warnings:

```js
Foo.prototype.__iterator__ = function() {
    return new FooIterator(this);
};

foo.__iterator__ = function () {};

foo["__iterator__"] = function () {};

```

The following patterns are not considered warnings:

```js
var __iterator__ = foo; // Not using the `__iterator__` property.
```

## Further Reading

* [MDN - Iterators and Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators)
* [ECMAScript 6 compatibility table - Iterators](http://kangax.github.io/es5-compat-table/es6/#Iterators)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-iterator.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-iterator.md)
