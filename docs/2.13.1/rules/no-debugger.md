---
title: Rule no-debugger
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow the use of `debugger` (no-debugger)

The `debugger` statement is used to tell the executing JavaScript environment to stop execution and start up a debugger at the current point in the code. This has fallen out of favor as a good practice with the advent of modern debugging and development tools. Production code should definitely not contain `debugger`, as it will cause the browser to stop executing code and open an appropriate debugger.

## Rule Details

This rule disallows `debugger` statements.

Example of **incorrect** code for this rule:

```js
/*eslint no-debugger: "error"*/

function isTruthy(x) {
    debugger;
    return Boolean(x);
}
```

Example of **correct** code for this rule:

```js
/*eslint no-debugger: "error"*/

function isTruthy(x) {
    return Boolean(x); // set a breakpoint at this line
}
```

## When Not To Use It

If your code is still very much in development and don't want to worry about stripping about `debugger` statements, then turn this rule off. You'll generally want to turn it back on when testing code prior to deployment.

## Further Reading

* [Debugger](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger)

## Related Rules

* [no-alert](no-alert)
* [no-console](no-console)

## Version

This rule was introduced in ESLint 0.0.2.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-debugger.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-debugger.md)
