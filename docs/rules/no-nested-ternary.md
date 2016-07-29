---
title: Rule no-nested-ternary
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow nested ternary expressions (no-nested-ternary)

Nesting ternary expressions can make code more difficult to understand.

```js
var foo = bar ? baz : qux === quxx ? bing : bam;
```

## Rule Details

The `no-nested-ternary` rule disallows nested ternary expressions.

Examples of **incorrect** code for this rule:

```js
/*eslint no-nested-ternary: "error"*/

var thing = foo ? bar : baz === qux ? quxx : foobar;

foo ? baz === qux ? quxx() : foobar() : bar();
```

Examples of **correct** code for this rule:

```js
/*eslint no-nested-ternary: "error"*/

var thing = foo ? bar : foobar;

var thing;

if (foo) {
  thing = bar;
} else if (baz === qux) {
  thing = quxx;
} else {
  thing = foobar;
}
```

## Related Rules

* [no-ternary](no-ternary)
* [no-unneeded-ternary](no-unneeded-ternary)

## Version

This rule was introduced in ESLint 0.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-nested-ternary.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-nested-ternary.md)
