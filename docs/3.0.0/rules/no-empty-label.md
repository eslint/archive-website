---
title: no-empty-label - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# no-empty-label: disallow labels for anything other than loops and switches

(removed) This rule was **removed** in ESLint v2.0 and **replaced** by the [no-labels](no-labels) rule.

Labeled statements are only used in conjunction with labeled break and continue statements. ECMAScript has no goto statement.


## Rule Details

This error occurs when a label is used to mark a statement that is not an iteration or switch

Example of **incorrect** code for this rule:

```js
/*eslint no-empty-label: "error"*/

labeled:
var x = 10;
```

Example of **correct** code for this rule:

```js
/*eslint no-empty-label: "error"*/

labeled:
for (var i=10; i; i--) {
    // ...
}
```

## When Not To Use It

If you don't want to be notified about usage of labels, then it's safe to disable this rule.

## Related Rules

* [no-labels](./no-labels)
* [no-label-var](./no-label-var)
* [no-unused-labels](./no-unused-labels)

## Version

This rule was introduced in ESLint 0.0.9 and removed in 2.0.0-rc.0.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-empty-label.md)
