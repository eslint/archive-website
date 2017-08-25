---
title: no-negated-condition - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-negated-condition.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow negated conditions (no-negated-condition)

Negated conditions are more difficult to understand. Code can be made more readable by inverting the condition instead.

## Rule Details

This rule disallows negated conditions in either of the following:

* `if` statements which have an `else` branch
* ternary expressions

Examples of **incorrect** code for this rule:

```js
/*eslint no-negated-condition: "error"*/

if (!a) {
    doSomething();
} else {
    doSomethingElse();
}

if (a != b) {
    doSomething();
} else {
    doSomethingElse();
}

if (a !== b) {
    doSomething();
} else {
    doSomethingElse();
}

!a ? c : b
```

Examples of **correct** code for this rule:

```js
/*eslint no-negated-condition: "error"*/

if (!a) {
    doSomething();
}

if (!a) {
    doSomething();
} else if (b) {
    doSomething();
}

if (a != b) {
    doSomething();
}

a ? b : c
```

## Version

This rule was introduced in ESLint 1.6.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-negated-condition.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-negated-condition.md)
