---
title: prefer-rest-params - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/prefer-rest-params.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Suggest using the rest parameters instead of `arguments` (prefer-rest-params)

There are rest parameters in ES2015.
We can use that feature for variadic functions instead of the `arguments` variable.

`arguments` does not have methods of `Array.prototype`, so it's a bit of an inconvenience.

## Rule Details

This rule is aimed to flag usage of `arguments` variables.

## Examples

Examples of **incorrect** code for this rule:

```js
function foo() {
    console.log(arguments);
}

function foo(action) {
    var args = Array.prototype.slice.call(arguments, 1);
    action.apply(null, args);
}

function foo(action) {
    var args = [].slice.call(arguments, 1);
    action.apply(null, args);
}
```

Examples of **correct** code for this rule:

```js
function foo(...args) {
    console.log(args);
}

function foo(action, ...args) {
    action.apply(null, args); // or `action(...args)`, related to the `prefer-spread` rule.
}

// Note: the implicit arguments can be overwritten.
function foo(arguments) {
    console.log(arguments); // This is the first argument.
}
function foo() {
    var arguments = 0;
    console.log(arguments); // This is a local variable.
}
```

## When Not To Use It

This rule should not be used in ES3/5 environments.

In ES2015 (ES6) or later, if you don't want to be notified about `arguments` variables, then it's safe to disable this rule.

## Related Rules

* [prefer-spread](prefer-spread)

## Version

This rule was introduced in ESLint 2.0.0-alpha-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/prefer-rest-params.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/prefer-rest-params.md)
