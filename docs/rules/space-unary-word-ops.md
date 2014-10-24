---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require spaces following unary word operators (space-unary-word-ops)

Require spaces following unary word operators.

## Rule Details

The following patterns are considered warnings:

```js
typeof!a
```

```js
void{a:0}
```

```js
new[a][0]
```

```js
delete(a.b)
```

The following patterns are not considered warnings:

```js
delete a.b
```

```js
new C
```

```js
void 0
```

## Version

This rule was introduced in ESLint 0.1.4.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/space-unary-word-ops.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-unary-word-ops.md)
