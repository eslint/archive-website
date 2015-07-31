---
title: Rule arrow-spacing
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require space before/after arrow function's arrow (arrow-spacing)

This rule normalize style of spacing before/after an arrow function's arrow(`=>`).

```js
// { "before": true, "after": true }
(a) => {}

// { "before": false, "after": false }
(a)=>{}
```

## Rule Details

This rule takes an object argument with `before` and `after` properties, each with a Boolean value.

default configuration is `{ "before": true, "after": true }`.

`true` means there should be **one or more spaces** and `false` means **no spaces**.

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
