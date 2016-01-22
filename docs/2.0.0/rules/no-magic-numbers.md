---
title: Rule no-magic-numbers
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Magic Numbers (no-magic-numbers)

'Magic numbers' are numbers that occur multiple time in code without an explicit meaning.
They should preferably be replaced by named constants.

```js
var now = Date.now(),
    inOneHour = now + (60 * 60 * 1000);
```

## Rule Details

The `no-magic-numbers` rule aims to make code more readable and refactoring easier by ensuring that special numbers
are declared as constants to make their meaning explicit.

The following pattern is considered a problem:

```js
/*eslint no-magic-numbers: 2*/

var dutyFreePrice = 100,
    finalPrice = dutyFreePrice + (dutyFreePrice * 0.25); /*error No magic number: 0.25*/


/*eslint no-magic-numbers: 2*/

var data = ['foo', 'bar', 'baz'];
var thirdValue = data[3]; /*error No magic number: 3*/
```

The following pattern is considered okay:

```js
/*eslint no-magic-numbers: 2*/

var TAX_PERCENTAGE = 0.25;

var dutyFreePrice = 100,
    finalPrice = dutyFreePrice + (dutyFreePrice * TAX_PERCENTAGE);
```

## Options

### `ignore`

An array of numbers to ignore. It's set to `[]` by default.
If provided, it must be an `Array`.

### `ignoreArrayIndexes`

A boolean to specify if numbers used as array indexes are considered okay. `false` by default.

The following pattern is considered okay:

```js
/*eslint no-magic-numbers: 2, { ignoreArrayIndexes: true }*/

var data = ['foo', 'bar', 'baz'];
var thirdValue = data[3];
```

### `enforceConst`

A boolean to specify if we should check for the const keyword in variable declaration of numbers. `false` by default.

### `detectObjects`

A boolean to specify if we should detect numbers when setting object properties for example. `false` by default.

## Version

This rule was introduced in ESLint 1.7.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-magic-numbers.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-magic-numbers.md)
