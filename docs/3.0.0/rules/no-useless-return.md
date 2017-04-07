---
title: no-useless-return - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow redundant return statements (no-useless-return)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

A `return;` statement with nothing after it is redundant, and has no effect on the runtime behavior of a function. This can be confusing, so it's better to disallow these redundant statements.

## Rule Details

This rule aims to report redundant `return` statements.

Examples of **incorrect** code for this rule:

```js
/* eslint no-useless-return: "error" */

function foo() { return; }

function foo() {
  doSomething();
  return;
}

function foo() {
  if (condition) {
    bar();
    return;
  } else {
    baz();
  }
}

function foo() {
  switch (bar) {
    case 1:
      doSomething();
    default:
      doSomethingElse();
      return;
  }
}

```

Examples of **correct** code for this rule:

```js
/* eslint no-useless-return: "error" */

function foo() { return 5; }

function foo() {
  return doSomething();
}

function foo() {
  if (condition) {
    bar();
    return;
  } else {
    baz();
  }
  qux();
}

function foo() {
  switch (bar) {
    case 1:
      doSomething();
      return;
    default:
      doSomethingElse();
  }
}

function foo() {
  for (const foo of bar) {
    return;
  }
}

```

## When Not To Use It

If you don't care about disallowing redundant return statements, you can turn off this rule.

## Version

This rule was introduced in ESLint 3.9.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-return.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-return.md)
