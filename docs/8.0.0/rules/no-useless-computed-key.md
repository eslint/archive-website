---
title: no-useless-computed-key - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/no-useless-computed-key.md
rule_type: suggestion
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow unnecessary computed property keys in objects and classes (no-useless-computed-key)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

It's unnecessary to use computed properties with literals such as:

```js
var foo = {["a"]: "b"};
```

The code can be rewritten as:

```js
var foo = {"a": "b"};
```

## Rule Details

This rule disallows unnecessary usage of computed property keys.

Examples of **incorrect** code for this rule:

```js
/*eslint no-useless-computed-key: "error"*/

var a = { ['0']: 0 };
var a = { ['0+1,234']: 0 };
var a = { [0]: 0 };
var a = { ['x']: 0 };
var a = { ['x']() {} };
```

Examples of **correct** code for this rule:

```js
/*eslint no-useless-computed-key: "error"*/

var c = { 'a': 0 };
var c = { 0: 0 };
var a = { x() {} };
var c = { a: 0 };
var c = { '0+1,234': 0 };
```

Examples of additional **correct** code for this rule:

```js
/*eslint no-useless-computed-key: "error"*/

var c = {
    "__proto__": foo, // defines object's prototype

    ["__proto__"]: bar // defines a property named "__proto__"
};
```

## Options

This rule has an object option:

* `enforceForClassMembers` set to `true` additionally applies this rule to class members (Default `false`).

### enforceForClassMembers

By default, this rule does not check class declarations and class expressions,
as the default value for `enforceForClassMembers` is `false`.

When `enforceForClassMembers` is set to `true`, the rule will also disallow unnecessary computed keys inside of class fields, class methods, class getters, and class setters.

Examples of **incorrect** code for this rule with the `{ "enforceForClassMembers": true }` option:

```js
/*eslint no-useless-computed-key: ["error", { "enforceForClassMembers": true }]*/

class Foo {
    ["foo"] = "bar";

    [0]() {}
    ['a']() {}
    get ['b']() {}
    set ['c'](value) {}

    static ["foo"] = "bar";

    static ['a']() {}
}
```

Examples of **correct** code for this rule with the `{ "enforceForClassMembers": true }` option:

```js
/*eslint no-useless-computed-key: ["error", { "enforceForClassMembers": true }]*/

class Foo {
    "foo" = "bar";

    0() {}
    'a'() {}
    get 'b'() {}
    set 'c'(value) {}

    static "foo" = "bar";

    static 'a'() {}
}
```

Examples of additional **correct** code for this rule with the `{ "enforceForClassMembers": true }` option:

```js
/*eslint no-useless-computed-key: ["error", { "enforceForClassMembers": true }]*/

class Foo {
    ["constructor"]; // instance field named "constructor"

    "constructor"() {} // the constructor of this class

    ["constructor"]() {} // method named "constructor"

    static ["constructor"]; // static field named "constructor"

    static ["prototype"]; // runtime error, it would be a parsing error without `[]`
}
```

## When Not To Use It

If you don't want to be notified about unnecessary computed property keys, you can safely disable this rule.

## Version

This rule was introduced in ESLint 2.9.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-useless-computed-key.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-useless-computed-key.md)
