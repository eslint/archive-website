---
title: arrow-spacing
layout: doc
edit_link: https://github.com/eslint/eslint/edit/main/docs/src/rules/arrow-spacing.md
rule_type: layout
---



(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Requires space before/after arrow function's arrow.

This rule normalize style of spacing before/after an arrow function's arrow(`=>`).

```js
/*eslint-env es6*/

// { "before": true, "after": true }
(a) => {}

// { "before": false, "after": false }
(a)=>{}
```

## Rule Details

This rule takes an object argument with `before` and `after` properties, each with a Boolean value.

The default configuration is `{ "before": true, "after": true }`.

`true` means there should be **one or more spaces** and `false` means **no spaces**.

Examples of **incorrect** code for this rule with the default `{ "before": true, "after": true }` option:

```js
/*eslint arrow-spacing: "error"*/
/*eslint-env es6*/

()=> {};
() =>{};
(a)=> {};
(a) =>{};
a =>a;
a=> a;
()=> {'\n'};
() =>{'\n'};
```

Examples of **correct** code for this rule with the default `{ "before": true, "after": true }` option:

```js
/*eslint arrow-spacing: "error"*/
/*eslint-env es6*/

() => {};
(a) => {};
a => a;
() => {'\n'};
```

Examples of **incorrect** code for this rule with the `{ "before": false, "after": false }` option:

```js
/*eslint arrow-spacing: ["error", { "before": false, "after": false }]*/
/*eslint-env es6*/

() =>{};
(a) => {};
()=> {'\n'};
```

Examples of **correct** code for this rule with the `{ "before": false, "after": false }` option:

```js
/*eslint arrow-spacing: ["error", { "before": false, "after": false }]*/
/*eslint-env es6*/

()=>{};
(a)=>{};
()=>{'\n'};
```

Examples of **incorrect** code for this rule with the `{ "before": false, "after": true }` option:

```js
/*eslint arrow-spacing: ["error", { "before": false, "after": true }]*/
/*eslint-env es6*/

() =>{};
(a) => {};
()=>{'\n'};
```

Examples of **correct** code for this rule with the `{ "before": false, "after": true }` option:

```js
/*eslint arrow-spacing: ["error", { "before": false, "after": true }]*/
/*eslint-env es6*/

()=> {};
(a)=> {};
()=> {'\n'};
```

## Version

This rule was introduced in ESLint 1.0.0-rc-1.

## Resources

* [Rule source](https://github.com/eslint/eslint/tree/HEAD/lib/rules/arrow-spacing.js)
* [Test source](https://github.com/eslint/eslint/tree/HEAD/tests/lib/rules/arrow-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/HEAD/docs/src/rules/arrow-spacing.md)
