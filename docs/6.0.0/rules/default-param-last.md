---
title: default-param-last - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/default-param-last.md
rule_type: suggestion
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# enforce default parameters to be last (default-param-last)

Putting default parameter at last allows function calls to omit optional tail arguments.

```js
// Correct: optional argument can be omitted
function createUser(id, isAdmin = false) {}
createUser("tabby")

// Incorrect: optional argument can **not** be omitted
function createUser(isAdmin = false, id) {}
createUser(undefined, "tabby")
```

## Rule Details

This rule enforces default parameters to be the last of parameters.

Examples of **incorrect** code for this rule:

```js
/* eslint default-param-last: ["error"] */

function f(a = 0, b) {}

function f(a, b = 0, c) {}
```

Examples of **correct** code for this rule:

```js
/* eslint default-param-last: ["error"] */

function f(a, b = 0) {}
```

## Version

This rule was introduced in ESLint 6.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/default-param-last.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/default-param-last.md)
