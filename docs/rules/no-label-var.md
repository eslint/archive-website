---
title: Rule no-label-var
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Labels That Are Variables Names (no-label-var)

## Rule Details

This rule aims to create clearer code by disallowing the bad practice of creating a label that shares a name with a variable that is in scope.

Examples of **incorrect** code for this rule:

```js
/*eslint no-label-var: "error"*/

var x = foo;
function bar() {
x:
  for (;;) {
    break x;
  }
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-label-var: "error"*/

// The variable that has the same name as the label is not in scope.

function foo() {
  var q = t;
}

function bar() {
q:
  for(;;) {
    break q;
  }
}
```

## When Not To Use It

If you don't want to be notified about usage of labels, then it's safe to disable this rule.

## Further Reading

* ['{a}' is a statement label](http://jslinterrors.com/a-is-a-statement-label/)

## Related Rules

* [no-extra-label](./no-extra-label)
* [no-labels](./no-labels)
* [no-unused-labels](./no-unused-labels)

## Version

This rule was introduced in ESLint 0.0.9.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-label-var.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-label-var.md)
