---
title: Rule constructor-super
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->
# Verify calls of `super()` in constructors (constructor-super)

Constructors of derived classes must call `super()`.
Constructors of non derived classes must not call `super()`.
If this is not observed, the javascript engine will raise a runtime error.

This rule checks whether or not there is a valid `super()` call.

## Rule Details

This rule is aimed to flag invalid/missing `super()` calls.

The following patterns are considered warnings:

```js
class A {
    constructor() {
        super(); // unexpected `super()`.
    }
}
```

```js
class A extends null {
    constructor() {
        super(); // unexpected `super()`.
    }
}
```

```js
class A extends B {
    constructor() { } // requires `super()`.
}
```

The following patterns are not considered warnings:

```js
class A {
    constructor() { }
}
```

```js
class A extends null {
    constructor() { }
}
```

```js
class A extends B {
    constructor() {
        super();
    }
}
```

## When Not to Use It

If you don't want to be notified about invalid/missing `super()` callings in constructors, you can safely disable this rule.

## Version

This rule was introduced in ESLint 0.24.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/constructor-super.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/constructor-super.md)
