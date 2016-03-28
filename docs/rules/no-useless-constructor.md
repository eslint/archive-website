---
title: Rule no-useless-constructor
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary constructor (no-useless-constructor)

ES2015 provides a default class constructor if one is not specified. As such, it is unnecessary to provide an empty constructor or one that simply delegates into its parent class, as in the following examples:

```js
class A {
    constructor () {
    }
}

class A extends B {
    constructor (value) {
      super(value);
    }
}
```

## Rule Details

This rule flags class constructors that can be safely removed without changing how the class works.

The following patterns are considered problems:

```js
/*eslint no-useless-constructor: "error"*/
/*eslint-env es6*/

class A {
    constructor () {
    }
}

class A extends B {
    constructor (...args) {
      super(...args);
    }
}
```

The following patterns are not considered problems:

```js
/*eslint no-useless-constructor: "error"*/

class A { }

class A {
    constructor () {
        doSomething();
    }
}

class A extends B {
    constructor() {
        super('foo');
    }
}

class A extends B {
    constructor() {
        super();
        doSomething();
    }
}
```

## When Not To Use It

If you don't want to be notified about unnecessary constructors, you can safely disable this rule.

## Version

This rule was introduced in ESLint 2.0.0-beta.1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-constructor.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-constructor.md)
