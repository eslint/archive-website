---
title: switch-colon-spacing - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/switch-colon-spacing.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce spacing around colons of switch statements (switch-colon-spacing)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

Spacing around colons improves readability of `case`/`default` clauses.

## Rule Details

This rule controls spacing around colons of `case` and `default` clauses in `switch` statements.
This rule does the check only if the consecutive tokens exist on the same line.

This rule has 2 options that are boolean value.

```json
{
    "switch-colon-spacing": ["error", {"after": true, "before": false}]
}
```

- `"after": true` (Default) ... requires one or more spaces after colons.
- `"after": false` ... disallows spaces after colons.
- `"before": true` ... requires one or more spaces before colons.
- `"before": false` (Default) ... disallows before colons.


Examples of **incorrect** code for this rule:

```js
/*eslint switch-colon-spacing: "error"*/

switch (a) {
    case 0 :break;
    default :foo();
}
```

Examples of **correct** code for this rule:

```js
/*eslint switch-colon-spacing: "error"*/

switch (a) {
    case 0: foo(); break;
    case 1:
        bar();
        break;
    default:
        baz();
        break;
}
```

Examples of **incorrect** code for this rule with `{"after": false, "before": true}` option:

```js
/*eslint switch-colon-spacing: ["error", {"after": false, "before": true}]*/

switch (a) {
    case 0: break;
    default: foo();
}
```

Examples of **correct** code for this rule with `{"after": false, "before": true}` option:

```js
/*eslint switch-colon-spacing: ["error", {"after": false, "before": true}]*/

switch (a) {
    case 0 :foo(); break;
    case 1 :
        bar();
        break;
    default :
        baz();
        break;
}
```

## When Not To Use It

If you don't want to notify spacing around colons of switch statements, then it's safe to disable this rule.

## Version

This rule was introduced in ESLint 4.0.0-beta.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/switch-colon-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/switch-colon-spacing.md)
