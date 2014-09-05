---
title: ESLint
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Disallow new For Side Effects (no-new)

Calling constructors with the `new` keyword, without assigning the resulting object to a variable does is equivalent to simply calling the constructor without the `new` keyword. Thus, the constructor can be avoided and the function can be called directly.

```js
new Person();
```

## Rule Details

This rule is aimed at maintaining consistency and convention by disallowing constructor calls using the `new` keyword that do not assign the resulting object to a variable.

The following patterns are considered warnings:

```js
new Thing();
```

The following patterns are not considered warnings:

```js
var thing = new Thing();

Thing();
```

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-new.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-new.md)
