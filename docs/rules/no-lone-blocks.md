---
title: Rule no-lone-blocks
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow Unnecessary Nested Blocks (no-lone-blocks)

In JavaScript, standalone code blocks delimited by curly braces do not create a new scope and have no use. For example, these curly braces do nothing to `foo`:

```js
{
    var foo = bar();
}
```

## Rule details

This rule aims to eliminate unnecessary and potentially confusing blocks at the top level of a script or within other blocks.

The following patterns are considered warnings:

```js
{}

if (foo) {
    bar();
    {
        baz();
    }
}

function bar() {
    {
        baz();
    }
}
```

The following patterns are not considered warnings:

```js
while (foo) {
    bar();
}

if (foo) {
    if (bar) {
        baz();
    }
}

function bar() {
    baz();
}
```

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-lone-blocks.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-lone-blocks.md)
