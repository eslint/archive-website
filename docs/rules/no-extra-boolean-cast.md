---
title: no-extra-boolean-cast
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/no-extra-boolean-cast.md
rule_type: suggestion
---



(recommended) The `"extends": "eslint:recommended"` property in a configuration file enables this rule.



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Disallows unnecessary boolean casts.

In contexts such as an `if` statement's test where the result of the expression will already be coerced to a Boolean, casting to a Boolean via double negation (`!!`) or a `Boolean` call is unnecessary. For example, these `if` statements are equivalent:

```js
if (!!foo) {
    // ...
}

if (Boolean(foo)) {
    // ...
}

if (foo) {
    // ...
}
```

## Rule Details

This rule disallows unnecessary boolean casts.

Examples of **incorrect** code for this rule:

```js
/*eslint no-extra-boolean-cast: "error"*/

var foo = !!!bar;

var foo = !!bar ? baz : bat;

var foo = Boolean(!!bar);

var foo = new Boolean(!!bar);

if (!!foo) {
    // ...
}

if (Boolean(foo)) {
    // ...
}

while (!!foo) {
    // ...
}

do {
    // ...
} while (Boolean(foo));

for (; !!foo; ) {
    // ...
}
```

Examples of **correct** code for this rule:

```js
/*eslint no-extra-boolean-cast: "error"*/

var foo = !!bar;
var foo = Boolean(bar);

function foo() {
    return !!bar;
}

var foo = bar ? !!baz : !!bat;
```

## Options

This rule has an object option:

* `"enforceForLogicalOperands"` when set to `true`, in addition to checking default contexts, checks whether the extra boolean cast is contained within a logical expression. Default is `false`, meaning that this rule by default does not warn about extra booleans cast inside logical expression.

### enforceForLogicalOperands

Examples of **incorrect** code for this rule with `"enforceForLogicalOperands"` option set to `true`:

```js
/*eslint no-extra-boolean-cast: ["error", {"enforceForLogicalOperands": true}]*/

if (!!foo || bar) {
    //...
}

while (!!foo && bar) {
    //...
}

if ((!!foo || bar) && baz) {
    //...
}

foo && Boolean(bar) ? baz : bat

var foo = new Boolean(!!bar || baz)
```

Examples of **correct** code for this rule with `"enforceForLogicalOperands"` option set to `true`:

```js
/*eslint no-extra-boolean-cast: ["error", {"enforceForLogicalOperands": true}]*/

if (foo || bar) {
    //...
}

while (foo && bar) {
    //...
}

if ((foo || bar) && baz) {
    //...
}

foo && bar ? baz : bat

var foo = new Boolean(bar || baz)

var foo = !!bar || baz;
```

## Version

This rule was introduced in ESLint 0.4.0.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/no-extra-boolean-cast.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/no-extra-boolean-cast.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/no-extra-boolean-cast.md)
