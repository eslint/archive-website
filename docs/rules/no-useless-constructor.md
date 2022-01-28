---
title: no-useless-constructor - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/rules/no-useless-constructor.md
rule_type: suggestion
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# no-useless-constructor

Disallows unnecessary constructors.

ES2015 provides a default class constructor if one is not specified. As such, it is unnecessary to provide an empty constructor or one that simply delegates into its parent class, as in the following examples:

```js
class A {
    constructor () {
    }
}

class B extends A {
    constructor (value) {
      super(value);
    }
}
```

## Rule Details

This rule flags class constructors that can be safely removed without changing how the class works.

## Examples

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-constructor: "error"*/
/*eslint-env es6*/

class A {
    constructor () {
    }
}

class B extends A {
    constructor (...args) {
      super(...args);
    }
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-constructor: "error"*/

class A { }

class A {
    constructor () {
        doSomething();
    }
}

class B extends A {
    constructor() {
        super('foo');
    }
}

class B extends A {
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

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-useless-constructor.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-useless-constructor.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/rules/no-useless-constructor.md)
