---
title: Rule arrow-spacing
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require space before/after arrow functions arrow (arrow-spacing)

This rule normalize style of spacing before/after of arrow functions arrow(`=>`).

```js
// { "before": true, "after": true }
(a) => {}

// { "before": false, "after": false }
(a)=>{}
```

## Rule Details

this rules takes one arguments of structure contains `before` and `after` property
and each property has bool value.

default configuration is `{ "before": true, "after": true }`.

`true` means there should have **one space** and `false` means **no space**.

The following patterns are considered warnings if `{ "before": true, "after": true }`.

```js
()=> {}
() =>{}
(a)=> {}
(a) =>{}
a =>a
a=> a
()=> {\n}
() =>{\n}
```

The following patterns are not warnings if `{ "before": true, "after": true }`.

```js
() => {}
(a) => {}
a => a
() => {\n}
```

The following patterns are not warnings if `{ "before": false, "after": false }`.

```js
()=>{}
(a)=>{}
a=>a
()=>{\n}
```

The following patterns are not warnings if `{ "before": true, "after": false }`.

```js
() =>{}
(a) =>{}
a =>a
() =>{\n}
```

The following patterns are not warnings if `{ "before": false, "after": true }`.

```js
()=> {}
(a)=> {}
a=> a
()=> {\n}
```

## Version

This rule was introduced in ESLint 1.0.0-rc-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/arrow-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/arrow-spacing.md)
