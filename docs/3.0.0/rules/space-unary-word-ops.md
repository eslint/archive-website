---
title: space-unary-word-ops - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# space-unary-word-ops: require spaces after unary word operators

(removed) This rule was **removed** in ESLint v0.10.0 and **replaced** by the [space-unary-ops](space-unary-ops) rule.

Require spaces following unary word operators.

## Rule Details

Examples of **incorrect** code for this rule:

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

Examples of **correct** code for this rule:

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

This rule was introduced in ESLint 0.1.4 and removed in 0.10.0.

## Resources

* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-unary-word-ops.md)
