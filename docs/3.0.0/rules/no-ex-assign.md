---
title: no-ex-assign - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow reassigning exceptions in `catch` clauses (no-ex-assign)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

If a `catch` clause in a `try` statement accidentally (or purposely) assigns another value to the exception parameter, it impossible to refer to the error from that point on.
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

## Further Reading

* [The "catch" with try...catch](http://weblog.bocoup.com/the-catch-with-try-catch/) by Ben Alman explains how the exception identifier can leak into the outer scope in IE 6-8

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-ex-assign.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-ex-assign.md)
