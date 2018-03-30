---
title: yield-star-spacing - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/yield-star-spacing.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce spacing around the `*` in `yield*` expressions (yield-star-spacing)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

## Rule Details

This rule enforces spacing around the `*` in `yield*` expressions.

To use this rule you either need to [use the `es6` environment](../user-guide/configuring) or
[set `ecmaVersion` to `6` in `parserOptions`](../user-guide/configuring).

## Options

The rule takes one option, an object, which has two keys `before` and `after` having boolean values `true` or `false`.

* `before` enforces spacing between the `yield` and the `*`.
  If `true`, a space is required, otherwise spaces are disallowed.

* `after` enforces spacing between the `*` and the argument.
  If it is `true`, a space is required, otherwise spaces are disallowed.

The default is `{"before": false, "after": true}`.

```json
"yield-star-spacing": ["error", {"before": true, "after": false}]
```

The option also has a string shorthand:

* `{"before": false, "after": true}` → `"after"`
* `{"before": true, "after": false}` → `"before"`
* `{"before": true, "after": true}` → `"both"`
* `{"before": false, "after": false}` → `"neither"`

```json
"yield-star-spacing": ["error", "after"]
```

## Examples

### after

Examples of **correct** code for this rule with the default `"after"` option:

```js
/*eslint yield-star-spacing: ["error", "after"]*/
/*eslint-env es6*/

function* generator() {
  yield* other();
}
```

### before

Examples of **correct** code for this rule with the `"before"` option:

```js
/*eslint yield-star-spacing: ["error", "before"]*/
/*eslint-env es6*/

function *generator() {
  yield *other();
}
```

### both

Examples of **correct** code for this rule with the `"both"` option:

```js
/*eslint yield-star-spacing: ["error", "both"]*/
/*eslint-env es6*/

function * generator() {
  yield * other();
}
```

### neither

Examples of **correct** code for this rule with the `"neither"` option:

```js
/*eslint yield-star-spacing: ["error", "neither"]*/
/*eslint-env es6*/

function*generator() {
  yield*other();
}
```

## When Not To Use It

If your project will not be using generators or you are not concerned with spacing consistency, you do not need this rule.

## Further Reading

* [Understanding ES6: Generators](https://leanpub.com/understandinges6/read/#leanpub-auto-generators)

## Version

This rule was introduced in ESLint 2.0.0-alpha-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/yield-star-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/yield-star-spacing.md)
