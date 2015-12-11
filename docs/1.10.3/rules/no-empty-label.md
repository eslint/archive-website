---
title: Rule no-empty-label
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# No empty labels (no-empty-label)

Labeled statements are only used in conjunction with labeled break and continue statements. ECMAScript has no goto statement.


## Rule Details

This error occurs when a label is used to mark a statement that is not an iteration or switch

The following patterns are considered problems:

```js
/*eslint no-empty-label: 2*/

labeled:     /*error Unexpected label "labeled"*/
var x = 10;
```

The following patterns are not considered problems:

```js
/*eslint no-empty-label: 2*/

labeled:
for (var i=10; i; i--) {
    // ...
}
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-empty-label.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-empty-label.md)
