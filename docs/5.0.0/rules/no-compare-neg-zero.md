---
title: no-compare-neg-zero - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-compare-neg-zero.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow comparing against -0 (no-compare-neg-zero)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

## Rule Details

The rule should warn against code that tries to compare against -0, since that will not work as intended. That is, code like x === -0 will pass for both +0 and -0. The author probably intended Object.is(x, -0).

Examples of **incorrect** code for this rule:

```js

if (x === -0) {
    // doSomething()...
}
```

Examples of **correct** code for this rule:

```js

if (x === 0) {
    // doSomething()...
}
```

```js

if (Object.is(x, -0)) {
    // doSomething()...
}
```



## Version

This rule was introduced in ESLint 3.17.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-compare-neg-zero.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-compare-neg-zero.md)
