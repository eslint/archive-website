---
title: no-this-before-super - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow use of `this`/`super` before calling `super()` in constructors. (no-this-before-super)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

In the constructor of derived classes, if `this`/`super` are used before `super()` calls, it raises a reference error.

This rule checks `this`/`super` keywords in constructors, then reports those that are before `super()`.

## Rule Details

This rule is aimed to flag `this`/`super` keywords before `super()` callings.

## Examples

Examples of **incorrect** code for this rule:

```js
/*eslint no-this-before-super: "error"*/
/*eslint-env es6*/

class A extends B {
    constructor() {
        this.a = 0;
        super();
    }
}

class A extends B {
    constructor() {
        this.foo();
        super();
    }
}

class A extends B {
    constructor() {
        super.foo();
        super();
    }
}

class A extends B {
    constructor() {
        super(this.foo());
    }
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-this-before-super: "error"*/
/*eslint-env es6*/

class A {
    constructor() {
        this.a = 0; // OK, this class doesn't have an `extends` clause.
    }
}

class A extends B {
    constructor() {
        super();
        this.a = 0; // OK, this is after `super()`.
    }
}

class A extends B {
    foo() {
        this.a = 0; // OK. this is not in a constructor.
    }
}
```

## When Not To Use It

If you don't want to be notified about using `this`/`super` before `super()` in constructors, you can safely disable this rule.

## Version

This rule was introduced in ESLint 0.24.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-this-before-super.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-this-before-super.md)
