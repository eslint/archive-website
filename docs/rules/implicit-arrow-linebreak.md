---
title: implicit-arrow-linebreak - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/rules/implicit-arrow-linebreak.md
rule_type: layout
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# implicit-arrow-linebreak

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Enforces the location of arrow function bodies with implicit returns.

An arrow function body can contain an implicit return as an expression instead of a block body. It can be useful to enforce a consistent location for the implicitly returned expression.

## Rule Details

This rule aims to enforce a consistent location for an arrow function containing an implicit return.

### Options

This rule accepts a string option:

* `"beside"` (default) disallows a newline before an arrow function body.
* `"below"` requires a newline before an arrow function body.

Examples of **incorrect** code for this rule with the default `"beside"` option:

```js
/* eslint implicit-arrow-linebreak: ["error", "beside"] */

(foo) =>
  bar;

(foo) =>
  (bar);

(foo) =>
  bar =>
    baz;

(foo) =>
(
  bar()
);
```

Examples of **correct** code for this rule with the default `"beside"` option:

```js
/* eslint implicit-arrow-linebreak: ["error", "beside"] */

(foo) => bar;

(foo) => (bar);

(foo) => bar => baz;

(foo) => (
  bar()
);

// functions with block bodies allowed with this rule using any style
// to enforce a consistent location for this case, see the rule: `brace-style`
(foo) => {
  return bar();
}

(foo) =>
{
  return bar();
}
```

Examples of **incorrect** code for this rule with the `"below"` option:

```js
/* eslint implicit-arrow-linebreak: ["error", "below"] */

(foo) => bar;

(foo) => (bar);

(foo) => bar => baz;
```

Examples of **correct** code for this rule with the `"below"` option:

```js
/* eslint implicit-arrow-linebreak: ["error", "below"] */


(foo) =>
  bar;

(foo) =>
  (bar);

(foo) =>
  bar =>
    baz;
```

## When Not To Use It

If you're not concerned about consistent locations of implicitly returned arrow function expressions, you should not turn on this rule.

You can also disable this rule if you are using the `"always"` option for the [`arrow-body-style`](arrow-body-style), since this will disable the use of implicit returns in arrow functions.

## Related Rules

* [`brace-style`](brace-style) which enforces this behavior for arrow functions with block bodies.

## Version

This rule was introduced in ESLint 4.12.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/implicit-arrow-linebreak.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/implicit-arrow-linebreak.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/rules/implicit-arrow-linebreak.md)
