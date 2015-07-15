---
title: Rule no-ternary
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Ternary Operators (no-ternary)

The ternary operator is used to conditionally assign a value to a variable. Some believe that the use of ternary operators leads to unclear code.

```js
var foo = isBar ? baz : qux;
```

## Rule Details

The `no-ternary` rule aims to disallow the use of ternary operators.

The following patterns are considered warnings:

```js
var foo = isBar ? baz : qux;

foo ? bar() : baz();

function quux() {
  return foo ? bar : baz;
}
```

The following patterns are considered okay and could be used alternatively:

```js
var foo;

if (isBar) {
    foo = baz;
} else {
    foo = qux;
}

if (foo) {
    bar();
} else {
    baz();
}

function quux() {
    if (foo) {
        return bar;
    } else {
        return baz;
    }
}
```

## Related Rules

* [no-nested-ternary](no-nested-ternary)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-ternary.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-ternary.md)
