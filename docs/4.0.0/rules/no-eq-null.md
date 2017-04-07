---
title: no-eq-null - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Null Comparisons (no-eq-null)

Comparing to `null` without a type-checking operator (`==` or `!=`), can have unintended results as the comparison will evaluate to true when comparing to not just a `null`, but also an `undefined` value.

```js
if (foo == null) {
  bar();
}
```

## Rule Details

The `no-eq-null` rule aims reduce potential bug and unwanted behavior by ensuring that comparisons to `null` only match `null`, and not also `undefined`. As such it will flag comparisons to null when using `==` and `!=`.

Examples of **incorrect** code for this rule:

```js
/*eslint no-eq-null: "error"*/

if (foo == null) {
  bar();
}

while (qux != null) {
  baz();
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-eq-null: "error"*/

if (foo === null) {
  bar();
}

while (qux !== null) {
  baz();
}
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-eq-null.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-eq-null.md)
