---
title: arrow-spacing - Rules
layout: doc
edit_link: https://github.com/eslint/eslint/edit/master/docs/rules/arrow-spacing.md
---
<!-- Note: No pull requests accepted for this file. See README.md in the root directory for details. -->

# Require space before/after arrow function's arrow (arrow-spacing)

(fixable) The `--fix` option on the [command line](../user-guide/command-line-interface#fix) can automatically fix some of the problems reported by this rule.

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

* [Rule source](https://github.com/eslint/eslint/tree/master/lib/rules/arrow-spacing.js)
* [Documentation source](https://github.com/eslint/eslint/tree/master/docs/rules/arrow-spacing.md)
