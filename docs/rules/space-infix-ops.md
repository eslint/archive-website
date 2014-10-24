---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Require Spaces Around Infix Operators (space-infix-ops)

While formatting preferences are very personal, a number of style guides require spaces around operators, such as:

```js
var sum = 1 + 2;
```

The proponents of these extra spaces believe it make the code easier to read and can more easily highlight potential errors, such as:

```js
var sum = i+++2;
```

While this is valid JavaScript syntax, it is hard to determine what the author intended.

## Rule Details

This rule is aimed at ensuring there are spaces around infix operators.

The following patterns are considered warnings:

```js
a+b
```

```js
a+ b
```

```js
a +b
```

```js
a?b:c
```

The following patterns are not considered warnings:

```js
a + b
```

```js
a       + b
```

```js
a ? b : c
```
## Version

This rule was introduced in ESLint 0.2.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/space-infix-ops.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/space-infix-ops.md)
