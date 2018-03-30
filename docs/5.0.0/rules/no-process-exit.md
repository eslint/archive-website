---
title: no-process-exit - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-process-exit.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow process.exit() (no-process-exit)

The `process.exit()` method in Node.js is used to immediately stop the Node.js process and exit. This is a dangerous operation because it can occur in any method at any point in time, potentially stopping a Node.js application completely when an error occurs. For example:

```js
if (somethingBadHappened) {
    console.error("Something bad happened!");
    process.exit(1);
}
```

This code could appear in any module and will stop the entire application when `somethingBadHappened` is truthy. This doesn't give the application any chance to respond to the error. It's usually better to throw an error and allow the application to handle it appropriately:

```js
if (somethingBadHappened) {
    throw new Error("Something bad happened!");
}
```

By throwing an error in this way, other parts of the application have an opportunity to handle the error rather than stopping the application altogether. If the error bubbles all the way up to the process without being handled, then the process will exit and a non-zero exit code will returned, so the end result is the same.

## Rule Details

This rule aims to prevent the use of `process.exit()` in Node.js JavaScript. As such, it warns whenever `process.exit()` is found in code.

Examples of **incorrect** code for this rule:

```js
/*eslint no-process-exit: "error"*/

process.exit(1);
process.exit(0);
```

Examples of **correct** code for this rule:

```js
/*eslint no-process-exit: "error"*/

Process.exit();
var exit = process.exit;
```

## When Not To Use It

There may be a part of a Node.js application that is responsible for determining the correct exit code to return upon exiting. In that case, you should turn this rule off to allow proper handling of the exit code.

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-process-exit.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-process-exit.md)
