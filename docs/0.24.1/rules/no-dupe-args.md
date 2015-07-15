---
title: Rule no-dupe-args
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# No duplicate arguments (no-dupe-args)

In strict mode you will receive a `SyntaxError` if a function takes multiple arguments with the same name.
Outside of strict mode duplicate arguments will mask the value of the first argument. This rule checks for duplicate
parameter names to help prevent that mistake.

## Rule Details

This rule prevents having duplicate param names.

For example the following code will cause the rule to warn:

```js
function (a, b, a) {
    console.log("which a is it?", a);
}
```


## When Not To Use It

If your project uses strict mode this rule may not be needed as unique param names will be automatically enforced.

## Version

This rule was introduced in ESLint 0.16.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-dupe-args.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-dupe-args.md)
