---
title: no-self-assign - Rules
layout: doc
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Disallow Self Assignment (no-self-assign)

(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.

Self assignments have no effect, so probably those are an error due to incomplete refactoring.
Those indicate that what you should do is still remaining.

```js
foo = foo;
[bar, baz] = [bar, qiz];
```

## Rule Details

This rule is aimed at eliminating self assignments.

Examples of **incorrect** code for this rule:

```js
/*eslint no-self-assign: "error"*/

foo = foo;

[a, b] = [a, b];

[a, ...b] = [x, ...b];

({a, b} = {a, x});
```

Examples of **correct** code for this rule:

```js
/*eslint no-self-assign: "error"*/

foo = bar;
[a, b] = [b, a];

// This pattern is warned by the `no-use-before-define` rule.
let foo = foo;

// The default values have an effect.
[foo = 1] = [foo];
```

## Options

This rule has the option to check properties as well.

```json
{
    "no-self-assign": ["error", {"props": false}]
}
```

- `props` - if this is `true`, `no-self-assign` rule warns self-assignments of properties. Default is `false`.

### props

Examples of **incorrect** code for the `{ "props": true }` option:

```js
/*eslint no-self-assign: [error, {props: true}]*/

// self-assignments with properties.
obj.a = obj.a;
obj.a.b = obj.a.b;
obj["a"] = obj["a"];
obj[a] = obj[a];
```

Examples of **correct** code for the `{ "props": true }` option:

```js
/*eslint no-self-assign: [error, {props: true}]*/

// non-self-assignments with properties.
obj.a = obj.b;
obj.a.b = obj.c.b;
obj.a.b = obj.a.c;
obj[a] = obj["a"]

// This ignores if there is a function call.
obj.a().b = obj.a().b
a().b = a().b

// Known limitation: this does not support computed properties except single literal or single identifier.
obj[a + b] = obj[a + b];
obj["a" + "b"] = obj["a" + "b"];
```

## When Not To Use It

If you don't want to notify about self assignments, then it's safe to disable this rule.

## Version

This rule was introduced in ESLint 2.0.0-rc.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/no-self-assign.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/no-self-assign.md)
