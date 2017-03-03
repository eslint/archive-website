---
title: constructor-super - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Verify calls of `super()` in constructors (constructor-super)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Constructors of derived classes must call `super()`.
Constructors of non derived classes must not call `super()`.
If this is not observed, the javascript engine will raise a runtime error.

This rule checks whether or not there is a valid `super()` call.

## Rule Details

This rule is aimed to flag invalid/missing `super()` calls.

Examples of **incorrect** code for this rule:

```js
/*eslint constructor-super: "error"*/
/*eslint-env es6*/

class A {
    constructor() {
        super();  // This is a SyntaxError.
    }
}

class A extends B {
    constructor() { }  // Would throw a ReferenceError.
}

// Classes which inherits from a non constructor are always problems.
class A extends null {
    constructor() {
        super();  // Would throw a TypeError.
    }
}

class A extends null {
    constructor() { }  // Would throw a ReferenceError.
}
```

Examples of **correct** code for this rule:

```js
/*eslint constructor-super: "error"*/
/*eslint-env es6*/

class A {
    constructor() { }
}

class A extends B {
    constructor() {
        super();
    }
}
```

## When Not To Use It

If you don't want to be notified about invalid/missing `super()` callings in constructors, you can safely disable this rule.

## Version

This rule was introduced in ESLint 0.24.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/constructor-super.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/constructor-super.md)
