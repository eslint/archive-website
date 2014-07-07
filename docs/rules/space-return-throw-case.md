---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require spaces following `return`, `throw`, and `case` (space-return-throw-case)

Require spaces following `return`, `throw`, and `case`.

## Rule Details

The following patterns are considered warnings:

```js
throw{a:0}
```

```js
function f(){ return-a; }
```

```js
switch(a){ case'a': break; }
```

The following patterns are not considered warnings:

```js
throw {a: 0};
```

```js
function f(){ return -a; }
```

```js
function f(){ return; }
```

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/space-return-throw-case.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-return-throw-case.md)
