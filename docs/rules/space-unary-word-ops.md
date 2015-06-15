---
title: Rule space-unary-word-ops
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require spaces following unary word operators (space-unary-word-ops)

**Deprecation notice**: This rule is deprecated and has been superseded by the [space-unary-ops](space-unary-ops) rule. It has be removed in ESLint v0.10.0.

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
