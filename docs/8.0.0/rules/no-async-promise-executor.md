---
title: no-async-promise-executor - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-async-promise-executor.md
rule_type: problem
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# disallow using an async function as a Promise executor (no-async-promise-executor)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

The `new Promise` constructor accepts an *executor* function as an argument, which has `resolve` and `reject` parameters that can be used to control the state of the created Promise. For example:

```js
const result = new Promise(function executor(resolve, reject) {
  readFile('foo.txt', function(err, result) {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});
```

The executor function can also be an `async function`. However, this is usually a mistake, for a few reasons:

* If an async executor function throws an error, the error will be lost and won't cause the newly-constructed `Promise` to reject. This could make it difficult to debug and handle some errors.
* If a Promise executor function is using `await`, this is usually a sign that it is not actually necessary to use the `new Promise` constructor, or the scope of the `new Promise` constructor can be reduced.

## Rule Details

This rule aims to disallow async Promise executor functions.

Examples of **incorrect** code for this rule:

```js
const foo = new Promise(async (resolve, reject) => {
  readFile('foo.txt', function(err, result) {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const result = new Promise(async (resolve, reject) => {
  resolve(await foo);
});
```

Examples of **correct** code for this rule:

```js
const foo = new Promise((resolve, reject) => {
  readFile('foo.txt', function(err, result) {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
});

const result = Promise.resolve(foo);
```

## When Not To Use It

If your codebase doesn't support async function syntax, there's no need to enable this rule.

## Version

This rule was introduced in ESLint 5.3.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-async-promise-executor.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-async-promise-executor.md)
