---
title: class-methods-use-this - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Enforce that class methods utilize `this` (class-methods-use-this)

If a class method does not use `this`, it can safely be made a static function.

It's possible to have a class method which doesn't use `this`, such as:

```js
class A {
    constructor() {
        this.a = "hi";
    }

    print() {
        console.log(this.a);
    }

    sayHi() {
        console.log("hi");
    }
}

let aObj = new A();
a.sayHi(); // => "hi"
```

In the example above, the `sayHi` method doesn't use `this`, so we can make it a static method:

```js
class A {
    constructor() {
        this.a = "hi";
    }

    print() {
        console.log(this.a);
    }

    static sayHi() {
        console.log("hi");
    }
}

A.sayHi(); // => "hi"
```

## Rule Details

This rule is aimed to flag class methods that do not use `this`.

Examples of **incorrect** code for this rule:

```js
/*eslint class-methods-use-this: "error"*/
/*eslint-env es6*/

class A {
    foo() {
        console.log("Hello World");     /*error Expected 'this' to be used by class method 'foo'.*/
    }
}
```

Examples of **correct** code for this rule:

```js
/*eslint class-methods-use-this: "error"*/
/*eslint-env es6*/
class A {
    foo() {
        this.bar = "Hello World"; // OK, this is used
    }
}

class A {
    constructor() {
        // OK. constructor is exempt
    }
}

class A {
    static foo() {
        // OK. static methods aren't expected to use this.
    }
}
```

## Version

This rule was introduced in ESLint 3.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/class-methods-use-this.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/class-methods-use-this.md)
