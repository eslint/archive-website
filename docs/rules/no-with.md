---
title: Rule no-with
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# No with Statements (no-with)

The `with` statement is potentially problematic because it adds members of an object to the current scope, making it impossible to tell what a variable inside the block actually refers to. Additionally, the `with` statement cannot be used in strict mode.

## Rule Details

This rule is aimed at eliminating `with` statements.

The following patterns are considered warnings:

```js
with (foo) {
    // ...
}
```

## When Not To Use It

If you intentionally use `with` statements then you can disable this rule.

## Further Reading

* [with Statement Considered Harmful](http://www.yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/)

## Version

This rule was introduced in ESLint 0.0.2.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-with.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-with.md)
