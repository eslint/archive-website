---
title: Rule no-extra-boolean-cast
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Extra Boolean Casts (no-extra-boolean-cast)

In contexts such as an `if` statement's test where the result of the expression will already be coerced to a Boolean, casting to a Boolean via double negation (`!!`) or a `Boolean` call is unnecessary. For example, these `if` statements are equivalent:

```js
if (!!foo) {
    // ...
}

if (Boolean(foo)) {
    // ...
}

if (foo) {
    // ...
}
```

## Rule Details

This rule aims to eliminate the use of Boolean casts in an already Boolean context.

The following patterns are considered problems:

```js
/*eslint no-extra-boolean-cast: 2*/

var foo = !!!bar;             /*error Redundant double negation.*/

var foo = !!bar ? baz : bat;  /*error Redundant double negation.*/

var foo = Boolean(!!bar);     /*error Redundant double negation.*/

var foo = new Boolean(!!bar); /*error Redundant double negation.*/

if (!!foo) {                  /*error Redundant double negation.*/
    // ...
}

if (Boolean(foo)) {           /*error Redundant Boolean call.*/
    // ...
}

while (!!foo) {               /*error Redundant double negation.*/
    // ...
}

do {
    // ...
} while (Boolean(foo));       /*error Redundant Boolean call.*/

for (; !!foo; ) {             /*error Redundant double negation.*/
    // ...
}
```

The following patterns are not considered problems:

```js
/*eslint no-extra-boolean-cast: 2*/

var foo = !!bar;
var foo = Boolean(bar);

function foo() {
    return !!bar;
}

var foo = bar ? !!baz : !!bat;
```

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-extra-boolean-cast.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-extra-boolean-cast.md)
