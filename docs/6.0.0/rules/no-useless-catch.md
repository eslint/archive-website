---
title: no-useless-catch - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-useless-catch.md
rule_type: suggestion
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary catch clauses (no-useless-catch)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

A `catch` clause that only rethrows the original error is redundant, and has no effect on the runtime behavior of the program. These redundant clauses can be a source of confusion and code bloat, so it's better to disallow these unnecessary `catch` clauses.

## Rule Details

This rule reports `catch` clauses that only `throw` the caught error.

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-catch: "error"*/

try {
  doSomethingThatMightThrow();
} catch (e) {
  throw e;
}

try {
  doSomethingThatMightThrow();
} catch (e) {
  throw e;
} finally {
  cleanUp();
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-catch: "error"*/

try {
  doSomethingThatMightThrow();
} catch (e) {
  doSomethingBeforeRethrow();
  throw e;
}

try {
  doSomethingThatMightThrow();
} catch (e) {
  handleError(e);
}

try {
  doSomethingThatMightThrow();
} finally {
  cleanUp();
}
```

## When Not To Use It

If you don't want to be notified about unnecessary catch clauses, you can safely disable this rule.

## Version

This rule was introduced in ESLint 5.11.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-catch.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-catch.md)
