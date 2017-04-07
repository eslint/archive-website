---
title: no-ternary - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow ternary operators (no-ternary)

The ternary operator is used to conditionally assign a value to a variable. Some believe that the use of ternary operators leads to unclear code.

```js
var foo = isBar ? baz : qux;
```

## Rule Details

This rule disallows ternary operators.

Examples of **incorrect** code for this rule:

```js
/*eslint no-ternary: "error"*/

var foo = isBar ? baz : qux;

function quux() {
  return foo ? bar() : baz();
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-ternary: "error"*/

var foo;

if (isBar) {
    foo = baz;
} else {
    foo = qux;
}

function quux() {
    if (foo) {
        return bar();
    } else {
        return baz();
    }
}
```

## Related Rules

* [no-nested-ternary](no-nested-ternary)
* [no-unneeded-ternary](no-unneeded-ternary)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-ternary.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-ternary.md)
