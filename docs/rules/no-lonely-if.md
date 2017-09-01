---
title: no-lonely-if - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-lonely-if.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow `if` statements as the only statement in `else` blocks (no-lonely-if)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

If an `if` statement is the only statement in the `else` block, it is often clearer to use an `else if` form.

```js
if (foo) {
    // ...
} else {
    if (bar) {
        // ...
    }
}
```

should be rewritten as

```js
if (foo) {
    // ...
} else if (bar) {
    // ...
}
```

## Rule Details

This rule disallows `if` statements as the only statement in `else` blocks.

Examples of **incorrect** code for this rule:

```js
/*eslint no-lonely-if: "error"*/

if (condition) {
    // ...
} else {
    if (anotherCondition) {
        // ...
    }
}

if (condition) {
    // ...
} else {
    if (anotherCondition) {
        // ...
    } else {
        // ...
    }
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-lonely-if: "error"*/

if (condition) {
    // ...
} else if (anotherCondition) {
    // ...
}

if (condition) {
    // ...
} else if (anotherCondition) {
    // ...
} else {
    // ...
}

if (condition) {
    // ...
} else {
    if (anotherCondition) {
        // ...
    }
    doSomething();
}
```

## When Not To Use It

Disable this rule if the code is clearer without requiring the `else if` form.

## Version

This rule was introduced in ESLint 0.6.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-lonely-if.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-lonely-if.md)
