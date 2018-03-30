---
title: for-direction - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/for-direction.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce "for" loop update clause moving the counter in the right direction. (for-direction)

## Rule Details

A `for` loop with a stop condition that can never be reached, such as one with a counter that moves in the wrong direction, will run infinitely. While there are occasions when an infinite loop is intended, the convention is to construct such loops as `while` loops. More typically, an infinite for loop is a bug.

Examples of **incorrect** code for this rule:

```js
/*eslint for-direction: "error"*/
for (var i = 0; i < 10; i--) {
}

for (var i = 10; i >= 0; i++) {
}
```

Examples of **correct** code for this rule:

```js
/*eslint for-direction: "error"*/
for (var i = 0; i < 10; i++) {
}
```

## Version

This rule was introduced in ESLint 4.0.0-beta.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/for-direction.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/for-direction.md)
