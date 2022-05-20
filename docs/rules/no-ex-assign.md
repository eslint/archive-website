---
title: no-ex-assign
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-ex-assign.md
rule_type: problem
further_reading:
- https://bocoup.com/blog/the-catch-with-try-catch
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Disallows reassigning exceptions in `catch` clauses.

If a `catch` clause in a `try` statement accidentally (or purposely) assigns another value to the exception parameter, it is impossible to refer to the error from that point on.
Since there is no `arguments` object to offer alternative access to this data, assignment of the parameter is absolutely destructive.

## Rule Details

This rule disallows reassigning exceptions in `catch` clauses.

Examples of **incorrect** code for this rule:

```js
/*eslint no-ex-assign: "error"*/

try {
    // code
} catch (e) {
    e = 10;
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-ex-assign: "error"*/

try {
    // code
} catch (e) {
    var foo = 10;
}
```

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-ex-assign.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-ex-assign.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-ex-assign.md)
