---
title: Rule no-array-constructor
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow creation of dense arrays using the `Array` constructor (no-array-constructor)

Use of the `Array` constructor to construct a new array is generally
discouraged in favour of array literal notation because of the single-argument
pitfall and because the `Array` global may be redefined. The exception is when
the Array constructor is used to intentionally create sparse arrays of a
specified size by giving the constructor a single numeric argument.

## Rule Details

The following patterns are considered problems:

```js
/*eslint no-array-constructor: 2*/

Array(0, 1, 2)     /*error The array literal notation [] is preferrable.*/
```

```js
/*eslint no-array-constructor: 2*/

new Array(0, 1, 2) /*error The array literal notation [] is preferrable.*/
```

The following patterns are not considered problems:

```js
/*eslint no-array-constructor: 2*/

Array(500)
```

```js
/*eslint no-array-constructor: 2*/

new Array(someOtherArray.length)
```

## When Not To Use It

This rule enforces a nearly universal stylistic concern. That being said, this
rule may be disabled if the constructor style is preferred.

## Related Rules

* [no-new-object](no-new-object)
* [no-new-wrappers](no-new-wrappers)

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-array-constructor.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-array-constructor.md)
