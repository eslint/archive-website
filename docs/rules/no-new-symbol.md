---
title: Rule no-new-symbol
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Symbol Constructor (no-new-symbol)

The `Symbol` constructor is not intended to be used with the `new` operator, but to be called as a function.

```js
var foo = new Symbol("foo");
```

This throws a `TypeError` exception.

## Rule Details

This rule is aimed at preventing the accidental calling of `Symbol` with the `new` operator.

The following patterns are considered problems:

```js
/*eslint no-new-symbol: "error"*/
/*eslint-env es6*/

var foo = new Symbol('foo');
```

The following patterns are not considered problems:

```js
/*eslint no-new-symbol: "error"*/
/*eslint-env es6*/

var foo = Symbol('foo');


// Ignores shadowed Symbol.
function bar(Symbol) {
    const baz = new Symbol("baz");
}

```

## When Not To Use It

This rule should not be used in ES3/5 environments.

## Further Reading

* [Symbol Objects specification](http://www.ecma-international.org/ecma-262/6.0/#sec-symbol-objects)

## Version

This rule was introduced in ESLint 2.0.0-beta.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-new-symbol.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-new-symbol.md)
