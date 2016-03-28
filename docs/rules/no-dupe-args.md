---
title: Rule no-dupe-args
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# No duplicate arguments (no-dupe-args)

In strict mode you will receive a `SyntaxError` if a function takes multiple arguments with the same name.
Outside of strict mode duplicate arguments will mask the value of the first argument.

## Rule Details

This rule prevents duplicate parameter names in a function.

Examples of **incorrect** code for this rule:

```js
/*eslint no-dupe-args: "error"*/

function foo(a, b, a) {
    console.log("which a is it?", a);
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-dupe-args: "error"*/

function foo(a, b, c) {
    console.log(a, b, c);
}
```


## When Not To Use It

If your project uses strict mode this rule may not be needed as unique param names will be automatically enforced.

## Version

This rule was introduced in ESLint 0.16.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-dupe-args.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-dupe-args.md)
