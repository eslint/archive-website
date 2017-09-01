---
title: no-duplicate-case - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-duplicate-case.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Rule to disallow a duplicate case label (no-duplicate-case)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

If a `switch` statement has duplicate test expressions in `case` clauses, it is likely that a programmer copied a `case` clause but forgot to change the test expression.

## Rule Details

This rule disallows duplicate test expressions in `case` clauses of `switch` statements.

Examples of **incorrect** code for this rule:

```js
/*eslint no-duplicate-case: "error"*/

var a = 1,
    one = 1;

switch (a) {
    case 1:
        break;
    case 2:
        break;
    case 1:         // duplicate test expression
        break;
    default:
        break;
}

switch (a) {
    case one:
        break;
    case 2:
        break;
    case one:         // duplicate test expression
        break;
    default:
        break;
}

switch (a) {
    case "1":
        break;
    case "2":
        break;
    case "1":         // duplicate test expression
        break;
    default:
        break;
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-duplicate-case: "error"*/

var a = 1,
    one = 1;

switch (a) {
    case 1:
        break;
    case 2:
        break;
    case 3:
        break;
    default:
        break;
}

switch (a) {
    case one:
        break;
    case 2:
        break;
    case 3:
        break;
    default:
        break;
}

switch (a) {
    case "1":
        break;
    case "2":
        break;
    case "3":
        break;
    default:
        break;
}
```

## Version

This rule was introduced in ESLint 0.17.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-duplicate-case.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-duplicate-case.md)
