---
title: Rule no-duplicate-case
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Rule to disallow a duplicate case label (no-duplicate-case)

A switch statements with duplicate case labels is normally an indication of a programmer error.

In the following example the 3rd case label uses again the literal 1 that has already been used in the first case label.
Most likely the case block was copied from above and it was forgotten to change the literal.

```js
var a = 1;

switch (a) {
    case 1:
        break;
    case 2:
        break;
    case 1:         // duplicate literal 1
        break;
    default:
        break;
}
```

## Rule Details

This inspection reports any duplicated case labels on JavaScript switch statements.

The following patterns are considered warnings:

```js
var a = 1,
    one = 1;

switch (a) {
    case 1:
        break;
    case 1:
        break;
    case 2:
        break;
    default:
        break;
}

switch (a) {
    case "1":
        break;
    case "1":
        break;
    case "2":
        break;
    default:
        break;
}

switch (a) {
    case one:
        break;
    case one:
        break;
    case 2:
        break;
    default:
        break;
}
```

The following patterns are not considered warnings:

```js
var a = 1;

switch (a) {
    case 1:
        break;
    case 2:
        break;
    default:
        break;
}
```

## Version

This rule was introduced in ESLint 0.17.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-duplicate-case.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-duplicate-case.md)
